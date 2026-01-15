import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Megaphone, Pin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  usePromotionalBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  PromotionalBanner,
} from '@/hooks/useSiteSettings';
import { format } from 'date-fns';

const BannersTab = () => {
  const { data: banners = [], isLoading } = usePromotionalBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [form, setForm] = useState({
    message: '',
    link: '',
    is_active: true,
    is_sticky: false,
    background_color: '#B8860B',
    text_color: '#FFFFFF',
    start_date: '',
    end_date: '',
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setForm({
      message: '',
      link: '',
      is_active: true,
      is_sticky: false,
      background_color: '#B8860B',
      text_color: '#FFFFFF',
      start_date: '',
      end_date: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: PromotionalBanner) => {
    setEditingBanner(banner);
    setForm({
      message: banner.message,
      link: banner.link || '',
      is_active: banner.is_active,
      is_sticky: banner.is_sticky,
      background_color: banner.background_color || '#B8860B',
      text_color: banner.text_color || '#FFFFFF',
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const bannerData = {
      message: form.message,
      link: form.link || null,
      is_active: form.is_active,
      is_sticky: form.is_sticky,
      background_color: form.background_color,
      text_color: form.text_color,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner.id, ...bannerData });
    } else {
      await createBanner.mutateAsync(bannerData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    await deleteBanner.mutateAsync(id);
  };

  const handleToggleActive = async (banner: PromotionalBanner) => {
    await updateBanner.mutateAsync({ id: banner.id, is_active: !banner.is_active });
  };

  const handleToggleSticky = async (banner: PromotionalBanner) => {
    await updateBanner.mutateAsync({ id: banner.id, is_sticky: !banner.is_sticky });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading banners...
      </div>
    );
  }

  const activeBanners = banners.filter((b) => b.is_active);
  const inactiveBanners = banners.filter((b) => !b.is_active);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Megaphone className="text-gold" size={24} />
          Promotional Banners
        </h2>
        <motion.button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Create Banner
        </motion.button>
      </div>

      {/* Active Banners */}
      {activeBanners.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-green-700">
            <Eye size={18} />
            Active Banners ({activeBanners.length})
          </h3>
          <div className="space-y-3">
            {activeBanners.map((banner) => (
              <BannerRow
                key={banner.id}
                banner={banner}
                onEdit={() => openEditModal(banner)}
                onDelete={() => handleDelete(banner.id)}
                onToggleActive={() => handleToggleActive(banner)}
                onToggleSticky={() => handleToggleSticky(banner)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Banners */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-4">All Banners ({banners.length})</h3>
        {banners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
            <p>No banners created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <BannerRow
                key={banner.id}
                banner={banner}
                onEdit={() => openEditModal(banner)}
                onDelete={() => handleDelete(banner.id)}
                onToggleActive={() => handleToggleActive(banner)}
                onToggleSticky={() => handleToggleSticky(banner)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Megaphone className="text-gold" size={20} />
              {editingBanner ? 'Edit Banner' : 'Create Banner'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            <div
              className="p-4 rounded-xl text-center"
              style={{
                backgroundColor: form.background_color,
                color: form.text_color,
              }}
            >
              <p className="font-medium">{form.message || 'Your banner message here...'}</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Message *</label>
              <input
                type="text"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="🎉 Free shipping on orders over ₹2000!"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Link (optional)</label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="/shop or https://..."
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.background_color}
                    onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.background_color}
                    onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                    className="flex-1 bg-background border border-border px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.text_color}
                    onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.text_color}
                    onChange={(e) => setForm({ ...form, text_color: e.target.value })}
                    className="flex-1 bg-background border border-border px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
            </div>

            {/* Toggles */}
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
                  checked={form.is_sticky}
                  onChange={(e) => setForm({ ...form, is_sticky: e.target.checked })}
                  className="w-4 h-4 accent-gold rounded"
                />
                <span className="text-sm">Sticky (stays on scroll)</span>
              </label>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={createBanner.isPending || updateBanner.isPending || !form.message}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {(createBanner.isPending || updateBanner.isPending) && <Loader2 className="animate-spin" size={18} />}
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const BannerRow = ({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleSticky,
}: {
  banner: PromotionalBanner;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleSticky: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ backgroundColor: banner.background_color || '#B8860B' }}
          />
          <p className="font-medium truncate">{banner.message}</p>
          {banner.is_sticky && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full flex items-center gap-1">
              <Pin size={10} />
              Sticky
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {banner.start_date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(banner.start_date), 'MMM d')}
              {banner.end_date && ` - ${format(new Date(banner.end_date), 'MMM d')}`}
            </span>
          )}
          {banner.link && <span className="text-blue-600">{banner.link}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onToggleActive}
          className={`p-2 rounded-lg transition-colors ${
            banner.is_active ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={banner.is_active ? 'Hide' : 'Show'}
        >
          {banner.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
        </motion.button>
        <motion.button
          onClick={onToggleSticky}
          className={`p-2 rounded-lg transition-colors ${
            banner.is_sticky ? 'text-purple-600 hover:bg-purple-50' : 'text-muted-foreground hover:bg-muted'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={banner.is_sticky ? 'Unpin' : 'Pin'}
        >
          <Pin size={18} />
        </motion.button>
        <motion.button
          onClick={onEdit}
          className="p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit2 size={18} />
        </motion.button>
        <motion.button
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default BannersTab;
