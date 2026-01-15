import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, FolderTree, GripVertical, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useImageUpload } from '@/hooks/useImageUpload';

const CategoriesTab = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { uploadImage, isUploading } = useImageUpload();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setForm({ ...form, image_url: url });
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: categories.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const categoryData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      image_url: form.image_url || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryData });
    } else {
      await createCategory.mutateAsync(categoryData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const productsInCategory = products.filter(p => 
      categories.find(c => c.id === id)?.name === p.category
    );
    
    if (productsInCategory.length > 0) {
      if (!confirm(`This category has ${productsInCategory.length} products. Are you sure you want to delete it?`)) return;
    } else {
      if (!confirm('Are you sure you want to delete this category?')) return;
    }
    
    await deleteCategory.mutateAsync(id);
  };

  const handleToggleActive = async (category: Category) => {
    await updateCategory.mutateAsync({ id: category.id, is_active: !category.is_active });
  };

  const getProductCount = (categoryName: string) => {
    return products.filter(p => p.category === categoryName).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading categories...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <FolderTree className="text-gold" size={24} />
          Product Categories
        </h2>
        <motion.button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Add Category
        </motion.button>
      </div>

      {/* Categories List */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-4">All Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderTree size={48} className="mx-auto mb-4 opacity-50" />
            <p>No categories created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
              >
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="text-muted-foreground cursor-grab" size={18} />
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{category.name}</p>
                      {!category.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{category.slug}</span>
                      <span>{getProductCount(category.name)} products</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleToggleActive(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.is_active ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={category.is_active ? 'Hide' : 'Show'}
                  >
                    {category.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </motion.button>
                  <motion.button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <FolderTree className="text-gold" size={20} />
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ 
                    ...form, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="Category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-mono text-sm"
                placeholder="category-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                placeholder="Category description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Category Image</label>
              {form.image_url ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted group">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-gold cursor-pointer text-muted-foreground hover:text-gold transition-colors bg-background">
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={32} />
                  ) : (
                    <>
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-gold rounded"
              />
              <label htmlFor="is_active" className="text-sm">Active (visible on site)</label>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={createCategory.isPending || updateCategory.isPending || !form.name}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="animate-spin" size={18} />}
              {editingCategory ? 'Update Category' : 'Create Category'}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CategoriesTab;
