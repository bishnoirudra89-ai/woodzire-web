import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Star, Quote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, Testimonial } from '@/hooks/useTestimonials';

const TestimonialsTab = () => {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    rating: 5,
    text: '',
    product: '',
    is_active: true,
    is_featured: false,
  });

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setForm({
      name: '',
      location: '',
      rating: 5,
      text: '',
      product: '',
      is_active: true,
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      name: testimonial.name,
      location: testimonial.location || '',
      rating: testimonial.rating,
      text: testimonial.text,
      product: testimonial.product || '',
      is_active: testimonial.is_active,
      is_featured: testimonial.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const testimonialData = {
      name: form.name,
      location: form.location || null,
      rating: form.rating,
      text: form.text,
      product: form.product || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };

    if (editingTestimonial) {
      await updateTestimonial.mutateAsync({ id: editingTestimonial.id, ...testimonialData });
    } else {
      await createTestimonial.mutateAsync(testimonialData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    await deleteTestimonial.mutateAsync(id);
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    await updateTestimonial.mutateAsync({ id: testimonial.id, is_active: !testimonial.is_active });
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    await updateTestimonial.mutateAsync({ id: testimonial.id, is_featured: !testimonial.is_featured });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading testimonials...
      </div>
    );
  }

  const activeCount = testimonials.filter(t => t.is_active).length;
  const featuredCount = testimonials.filter(t => t.is_featured).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl flex items-center gap-2">
            <Quote className="text-gold" size={24} />
            Testimonials
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} active, {featuredCount} featured
          </p>
        </div>
        <motion.button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Add Testimonial
        </motion.button>
      </div>

      {/* Testimonials List */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Quote size={48} className="mx-auto mb-4 opacity-50" />
            <p>No testimonials yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-4 bg-background rounded-xl border border-border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{testimonial.name}</p>
                      {testimonial.location && (
                        <span className="text-sm text-muted-foreground">• {testimonial.location}</span>
                      )}
                      {!testimonial.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Hidden</span>
                      )}
                      {testimonial.is_featured && (
                        <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded-full">Featured</span>
                      )}
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < testimonial.rating ? 'fill-gold text-gold' : 'text-muted'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">"{testimonial.text}"</p>
                    {testimonial.product && (
                      <span className="inline-block text-xs text-gold bg-gold/10 px-2 py-1 rounded">
                        {testimonial.product}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleToggleFeatured(testimonial)}
                      className={`p-2 rounded-lg transition-colors ${
                        testimonial.is_featured ? 'text-gold hover:bg-gold/10' : 'text-muted-foreground hover:bg-muted'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={testimonial.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star size={18} className={testimonial.is_featured ? 'fill-gold' : ''} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleToggleActive(testimonial)}
                      className={`p-2 rounded-lg transition-colors ${
                        testimonial.is_active ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={testimonial.is_active ? 'Hide' : 'Show'}
                    >
                      {testimonial.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </motion.button>
                    <motion.button
                      onClick={() => openEditModal(testimonial)}
                      className="p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit2 size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(testimonial.id)}
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
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Quote className="text-gold" size={20} />
              {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Customer Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="California, USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    type="button"
                    onClick={() => setForm({ ...form, rating })}
                    className="p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star
                      size={24}
                      className={rating <= form.rating ? 'fill-gold text-gold' : 'text-muted'}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Testimonial Text *</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={4}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                placeholder="Share the customer's experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Product Purchased</label>
              <input
                type="text"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="Memorial Urn"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-gold rounded"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-gold rounded"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={createTestimonial.isPending || updateTestimonial.isPending || !form.name || !form.text}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {(createTestimonial.isPending || updateTestimonial.isPending) && <Loader2 className="animate-spin" size={18} />}
              {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TestimonialsTab;
