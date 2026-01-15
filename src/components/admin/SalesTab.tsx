import { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, Tag, Layers, CheckCircle, Loader2, Calendar, Play, Pause, Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts, useUpdateProduct } from '@/hooks/useProducts';
import { useScheduledSales, useCreateScheduledSale, useUpdateScheduledSale, useDeleteScheduledSale, ScheduledSale } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, isAfter, parseISO } from 'date-fns';

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const SalesTab = () => {
  const { toast } = useToast();
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const { data: scheduledSales = [], isLoading: salesLoading } = useScheduledSales();
  const createScheduledSale = useCreateScheduledSale();
  const updateScheduledSale = useUpdateScheduledSale();
  const deleteScheduledSale = useDeleteScheduledSale();

  const [saleType, setSaleType] = useState<'item' | 'category' | 'all'>('item');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Scheduled Sale Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<ScheduledSale | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    discount_percentage: 10,
    sale_type: 'all' as 'all' | 'category' | 'products',
    target_category: '',
    target_product_ids: [] as string[],
    start_date: '',
    end_date: '',
  });

  const categories = [...new Set(products.map((p) => p.category))];
  const productsOnSale = products.filter((p) => p.is_on_sale);

  const now = new Date();
  const activeSales = scheduledSales.filter(
    (s) => s.is_active && !s.is_paused && isBefore(parseISO(s.start_date), now) && isAfter(parseISO(s.end_date), now)
  );
  const upcomingSales = scheduledSales.filter((s) => isAfter(parseISO(s.start_date), now));
  const pastSales = scheduledSales.filter((s) => isBefore(parseISO(s.end_date), now));

  const handleApplySale = async () => {
    let targetProducts = [];

    if (saleType === 'all') {
      targetProducts = products;
    } else if (saleType === 'category') {
      targetProducts = products.filter((p) => p.category === selectedCategory);
    } else {
      targetProducts = products.filter((p) => selectedProductIds.includes(p.id));
    }

    if (targetProducts.length === 0) {
      toast({ title: 'No Products Selected', description: 'Please select products to apply sale.', variant: 'destructive' });
      return;
    }

    for (const product of targetProducts) {
      await updateProduct.mutateAsync({
        id: product.id,
        is_on_sale: true,
        discount_percentage: discountPercent,
      });
    }

    toast({
      title: 'Sale Applied',
      description: `${discountPercent}% discount applied to ${targetProducts.length} products.`,
    });
    setSelectedProductIds([]);
  };

  const handleRemoveSale = async (productId: string) => {
    await updateProduct.mutateAsync({
      id: productId,
      is_on_sale: false,
      discount_percentage: 0,
    });
  };

  const handleRemoveAllSales = async () => {
    if (!confirm('Remove sale from all products?')) return;

    for (const product of productsOnSale) {
      await updateProduct.mutateAsync({
        id: product.id,
        is_on_sale: false,
        discount_percentage: 0,
      });
    }

    toast({ title: 'Sales Removed', description: 'All sales have been removed.' });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const openScheduleModal = (sale?: ScheduledSale) => {
    if (sale) {
      setEditingSale(sale);
      setScheduleForm({
        name: sale.name,
        discount_percentage: sale.discount_percentage,
        sale_type: sale.sale_type as 'all' | 'category' | 'products',
        target_category: sale.target_category || '',
        target_product_ids: sale.target_product_ids || [],
        start_date: sale.start_date.split('T')[0],
        end_date: sale.end_date.split('T')[0],
      });
    } else {
      setEditingSale(null);
      setScheduleForm({
        name: '',
        discount_percentage: 10,
        sale_type: 'all',
        target_category: '',
        target_product_ids: [],
        start_date: '',
        end_date: '',
      });
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduledSale = async () => {
    if (!scheduleForm.name || !scheduleForm.start_date || !scheduleForm.end_date) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const saleData = {
      name: scheduleForm.name,
      discount_percentage: scheduleForm.discount_percentage,
      sale_type: scheduleForm.sale_type,
      target_category: scheduleForm.sale_type === 'category' ? scheduleForm.target_category : null,
      target_product_ids: scheduleForm.sale_type === 'products' ? scheduleForm.target_product_ids : null,
      start_date: scheduleForm.start_date,
      end_date: scheduleForm.end_date,
      is_active: true,
      is_paused: false,
    };

    if (editingSale) {
      await updateScheduledSale.mutateAsync({ id: editingSale.id, ...saleData });
    } else {
      await createScheduledSale.mutateAsync(saleData);
    }

    setIsScheduleModalOpen(false);
  };

  const handleTogglePause = async (sale: ScheduledSale) => {
    await updateScheduledSale.mutateAsync({ id: sale.id, is_paused: !sale.is_paused });
  };

  const handleDeleteScheduledSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled sale?')) return;
    await deleteScheduledSale.mutateAsync(id);
  };

  if (isLoading || salesLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Scheduled Sales */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg flex items-center gap-2">
            <Calendar className="text-gold" size={20} />
            Scheduled Sales
          </h3>
          <motion.button
            onClick={() => openScheduleModal()}
            className="px-4 py-2 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            Schedule Sale
          </motion.button>
        </div>

        {/* Active Sales */}
        {activeSales.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
              <Play size={14} />
              Live Now ({activeSales.length})
            </h4>
            <div className="space-y-2">
              {activeSales.map((sale) => (
                <ScheduledSaleRow key={sale.id} sale={sale} onEdit={openScheduleModal} onDelete={handleDeleteScheduledSale} onTogglePause={handleTogglePause} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sales */}
        {upcomingSales.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <Clock size={14} />
              Upcoming ({upcomingSales.length})
            </h4>
            <div className="space-y-2">
              {upcomingSales.map((sale) => (
                <ScheduledSaleRow key={sale.id} sale={sale} onEdit={openScheduleModal} onDelete={handleDeleteScheduledSale} onTogglePause={handleTogglePause} />
              ))}
            </div>
          </div>
        )}

        {/* Paused Sales */}
        {scheduledSales.filter((s) => s.is_paused).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-2">
              <Pause size={14} />
              Paused
            </h4>
            <div className="space-y-2">
              {scheduledSales
                .filter((s) => s.is_paused)
                .map((sale) => (
                  <ScheduledSaleRow key={sale.id} sale={sale} onEdit={openScheduleModal} onDelete={handleDeleteScheduledSale} onTogglePause={handleTogglePause} />
                ))}
            </div>
          </div>
        )}

        {scheduledSales.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No scheduled sales yet.</p>
          </div>
        )}
      </div>

      {/* Current Sales */}
      {productsOnSale.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg flex items-center gap-2">
              <Tag className="text-gold" size={20} />
              Active Sales ({productsOnSale.length})
            </h3>
            <motion.button
              onClick={handleRemoveAllSales}
              className="text-sm text-red-600 hover:underline"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Remove All Sales
            </motion.button>
          </div>
          <div className="grid gap-3">
            {productsOnSale.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground line-through">{formatINR(product.price)}</span>
                    <span className="text-gold font-medium">
                      {formatINR(product.price * (1 - (product.discount_percentage || 0) / 100))}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                      {product.discount_percentage}% off
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleRemoveSale(product.id)}
                  className="text-sm text-red-600 hover:underline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Remove
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Instant Sale */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-6 flex items-center gap-2">
          <Percent className="text-gold" size={20} />
          Apply Instant Sale
        </h3>

        {/* Sale Type Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.button
            onClick={() => setSaleType('item')}
            className={`p-4 rounded-xl border-2 transition-all ${
              saleType === 'item' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tag size={24} className={saleType === 'item' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
            <p className="text-sm font-medium">Specific Items</p>
          </motion.button>
          <motion.button
            onClick={() => setSaleType('category')}
            className={`p-4 rounded-xl border-2 transition-all ${
              saleType === 'category' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Layers size={24} className={saleType === 'category' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
            <p className="text-sm font-medium">By Category</p>
          </motion.button>
          <motion.button
            onClick={() => setSaleType('all')}
            className={`p-4 rounded-xl border-2 transition-all ${
              saleType === 'all' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle size={24} className={saleType === 'all' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
            <p className="text-sm font-medium">All Products</p>
          </motion.button>
        </div>

        {/* Discount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Discount Percentage</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="90"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-32 bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-lg"
            />
            <span className="text-xl">%</span>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25, 30].map((val) => (
                <motion.button
                  key={val}
                  onClick={() => setDiscountPercent(val)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    discountPercent === val ? 'bg-gold text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {val}%
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Selection */}
        {saleType === 'category' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            >
              <option value="">Choose a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({products.filter((p) => p.category === cat).length} products)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product Selection */}
        {saleType === 'item' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Select Products</label>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {products.filter(p => !p.is_on_sale).map((product) => (
                <label
                  key={product.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedProductIds.includes(product.id) ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
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
        )}

        <motion.button
          onClick={handleApplySale}
          disabled={
            updateProduct.isPending ||
            (saleType === 'category' && !selectedCategory) ||
            (saleType === 'item' && selectedProductIds.length === 0)
          }
          className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {updateProduct.isPending && <Loader2 className="animate-spin" size={18} />}
          Apply Sale
        </motion.button>
      </div>

      {/* Schedule Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Calendar className="text-gold" size={20} />
              {editingSale ? 'Edit Scheduled Sale' : 'Schedule Sale'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sale Name *</label>
              <input
                type="text"
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="Summer Sale 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Discount %</label>
              <input
                type="number"
                min="1"
                max="90"
                value={scheduleForm.discount_percentage}
                onChange={(e) => setScheduleForm({ ...scheduleForm, discount_percentage: Number(e.target.value) })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Apply To</label>
              <select
                value={scheduleForm.sale_type}
                onChange={(e) => setScheduleForm({ ...scheduleForm, sale_type: e.target.value as 'all' | 'category' | 'products' })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              >
                <option value="all">All Products</option>
                <option value="category">By Category</option>
                <option value="products">Specific Products</option>
              </select>
            </div>

            {scheduleForm.sale_type === 'category' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                <select
                  value={scheduleForm.target_category}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, target_category: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {scheduleForm.sale_type === 'products' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Products</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-xl">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleForm.target_product_ids.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setScheduleForm({ ...scheduleForm, target_product_ids: [...scheduleForm.target_product_ids, product.id] });
                          } else {
                            setScheduleForm({ ...scheduleForm, target_product_ids: scheduleForm.target_product_ids.filter(id => id !== product.id) });
                          }
                        }}
                        className="w-4 h-4 accent-gold rounded"
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date *</label>
                <input
                  type="date"
                  value={scheduleForm.start_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, start_date: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Date *</label>
                <input
                  type="date"
                  value={scheduleForm.end_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, end_date: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
            </div>

            <motion.button
              onClick={handleSaveScheduledSale}
              disabled={createScheduledSale.isPending || updateScheduledSale.isPending}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {(createScheduledSale.isPending || updateScheduledSale.isPending) && <Loader2 className="animate-spin" size={18} />}
              {editingSale ? 'Update Sale' : 'Schedule Sale'}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const ScheduledSaleRow = ({
  sale,
  onEdit,
  onDelete,
  onTogglePause,
}: {
  sale: ScheduledSale;
  onEdit: (sale: ScheduledSale) => void;
  onDelete: (id: string) => void;
  onTogglePause: (sale: ScheduledSale) => void;
}) => {
  const now = new Date();
  const isLive = !sale.is_paused && isBefore(parseISO(sale.start_date), now) && isAfter(parseISO(sale.end_date), now);
  const isUpcoming = isAfter(parseISO(sale.start_date), now);

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium">{sale.name}</p>
          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">{sale.discount_percentage}% off</span>
          {sale.is_paused && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs">Paused</span>
          )}
          {isLive && !sale.is_paused && (
            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(parseISO(sale.start_date), 'MMM d')} - {format(parseISO(sale.end_date), 'MMM d, yyyy')}
          </span>
          <span className="capitalize">{sale.sale_type === 'all' ? 'All Products' : sale.sale_type}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => onTogglePause(sale)}
          className={`p-2 rounded-lg transition-colors ${sale.is_paused ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={sale.is_paused ? 'Resume' : 'Pause'}
        >
          {sale.is_paused ? <Play size={18} /> : <Pause size={18} />}
        </motion.button>
        <motion.button
          onClick={() => onEdit(sale)}
          className="p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-gold/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit2 size={18} />
        </motion.button>
        <motion.button
          onClick={() => onDelete(sale.id)}
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

export default SalesTab;
