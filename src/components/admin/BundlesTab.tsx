import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Package, Percent, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBundles, useCreateBundle, useUpdateBundle, useDeleteBundle, Bundle } from '@/hooks/useBundles';
import { useProducts } from '@/hooks/useProducts';

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const BundlesTab = () => {
  const { data: bundles = [], isLoading } = useBundles();
  const { data: products = [] } = useProducts();
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();
  const deleteBundle = useDeleteBundle();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    discount_percentage: 10,
    is_active: true,
    productIds: [] as string[],
  });

  const handleOpenModal = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundle(bundle);
      setForm({
        name: bundle.name,
        description: bundle.description || '',
        discount_percentage: bundle.discount_percentage,
        is_active: bundle.is_active,
        productIds: bundle.items?.map((i) => i.product_id) || [],
      });
    } else {
      setEditingBundle(null);
      setForm({
        name: '',
        description: '',
        discount_percentage: 10,
        is_active: true,
        productIds: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || form.productIds.length < 2) return;

    if (editingBundle) {
      updateBundle.mutate({ id: editingBundle.id, ...form });
    } else {
      createBundle.mutate(form);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bundle?')) {
      deleteBundle.mutate(id);
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const calculateBundlePrice = () => {
    const selectedProducts = products.filter((p) => form.productIds.includes(p.id));
    const originalTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const discountedTotal = originalTotal * (1 - form.discount_percentage / 100);
    return { originalTotal, discountedTotal, savings: originalTotal - discountedTotal };
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading bundles...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Product Bundles</h2>
        <motion.button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Create Bundle
        </motion.button>
      </div>

      {bundles.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No bundles yet. Create your first bundle!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-lg">{bundle.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${bundle.is_active ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {bundle.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold font-medium flex items-center gap-1">
                      <Percent size={12} />
                      {bundle.discount_percentage}% off
                    </span>
                  </div>
                  {bundle.description && <p className="text-sm text-muted-foreground">{bundle.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleOpenModal(bundle)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(bundle.id)}
                    className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingBundle ? 'Edit Bundle' : 'Create Bundle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Bundle Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="e.g., Complete Home Décor Set"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                placeholder="Describe your bundle..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount_percentage}
                  onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 accent-gold rounded"
                  />
                  <span className="font-medium">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Products (min 2) *
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.productIds.includes(product.id)
                        ? 'border-gold bg-gold/5'
                        : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 accent-gold rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(product.price)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {form.productIds.length >= 2 && (
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <h4 className="font-medium mb-2">Bundle Pricing Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Total:</span>
                    <span className="line-through">{formatINR(calculateBundlePrice().originalTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundle Price:</span>
                    <span className="text-gold font-medium">{formatINR(calculateBundlePrice().discountedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Customer Saves:</span>
                    <span className="font-medium">{formatINR(calculateBundlePrice().savings)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-border">
              <motion.button
                onClick={handleSave}
                disabled={!form.name.trim() || form.productIds.length < 2 || createBundle.isPending || updateBundle.isPending}
                className="flex-1 py-3 bg-gold text-primary-foreground font-medium text-sm rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {editingBundle ? 'Update Bundle' : 'Create Bundle'}
              </motion.button>
              <motion.button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BundlesTab;
