import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const CompareDrawer = () => {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useCompare();
  const { addToCart } = useCart();

  if (compareItems.length === 0) return null;

  const specs = [
    { key: 'price', label: 'Price', format: (p: any) => formatPrice(p.price) },
    { key: 'wood_type', label: 'Wood Type', format: (p: any) => p.wood_type || 'N/A' },
    { key: 'category', label: 'Category', format: (p: any) => p.category },
    { key: 'stock', label: 'Availability', format: (p: any) => 
      p.is_made_to_order ? 'Made to Order' : p.stock_quantity > 0 ? 'In Stock' : 'Out of Stock' 
    },
    { key: 'prep_time', label: 'Prep Time', format: (p: any) => 
      p.is_made_to_order ? `${p.prep_time_days || 7} days` : 'Ready to ship' 
    },
    { key: 'dimensions', label: 'Dimensions', format: (p: any) => {
      if (!p.dimensions) return 'N/A';
      const d = p.dimensions;
      return `${d.height || '-'} × ${d.width || '-'} × ${d.depth || '-'}`;
    }},
  ];

  return (
    <>
      {/* Floating Compare Button */}
      <AnimatePresence>
        {!isCompareOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCompareOpen(true)}
            className="fixed bottom-24 right-6 z-40 bg-charcoal text-white p-4 rounded-full shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Scale size={20} />
            <span className="text-sm font-medium">{compareItems.length}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Compare Drawer */}
      <AnimatePresence>
        {isCompareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsCompareOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-5xl bg-background z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Scale size={24} className="text-gold" />
                  <h2 className="font-display text-xl">Compare Products ({compareItems.length})</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearCompare}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsCompareOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4 border-b border-border w-40"></th>
                        {compareItems.map((product) => (
                          <th key={product.id} className="p-4 border-b border-border min-w-[200px]">
                            <div className="relative group">
                              <button
                                onClick={() => removeFromCompare(product.id)}
                                className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                              <Link to={`/product/${product.id}`} onClick={() => setIsCompareOpen(false)}>
                                <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                                  <img
                                    src={product.images?.[0] || '/placeholder.svg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="font-display text-sm text-center hover:text-gold transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {specs.map((spec) => (
                        <tr key={spec.key} className="border-b border-border">
                          <td className="p-4 text-sm text-muted-foreground font-medium">{spec.label}</td>
                          {compareItems.map((product) => (
                            <td key={product.id} className="p-4 text-center">
                              <span className={spec.key === 'price' ? 'font-display text-gold text-lg' : 'text-sm'}>
                                {spec.format(product)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                      {/* Description Row */}
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground font-medium">Description</td>
                        {compareItems.map((product) => (
                          <td key={product.id} className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {product.description || 'No description available'}
                            </p>
                          </td>
                        ))}
                      </tr>
                      {/* Action Row */}
                      <tr>
                        <td className="p-4"></td>
                        {compareItems.map((product) => (
                          <td key={product.id} className="p-4 text-center">
                            <div className="space-y-2">
                              <motion.button
                                onClick={() => {
                                  addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.images?.[0] || '/placeholder.svg',
                                    woodType: product.wood_type || 'Wood',
                                    maxStock: product.stock_quantity,
                                  });
                                }}
                                disabled={product.stock_quantity === 0 && !product.is_made_to_order}
                                className="w-full py-3 bg-charcoal text-white text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <ShoppingBag size={14} />
                                Add to Cart
                              </motion.button>
                              <Link
                                to={`/product/${product.id}`}
                                onClick={() => setIsCompareOpen(false)}
                                className="block text-xs text-gold hover:underline"
                              >
                                View Details <ChevronRight size={12} className="inline" />
                              </Link>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompareDrawer;
