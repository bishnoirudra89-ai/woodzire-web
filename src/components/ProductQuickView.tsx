import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, X } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductQuickViewProps {
  product: Product;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductQuickView = ({ product, isVisible, position, onClose }: ProductQuickViewProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
    }, 1);
    
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
    
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-50 w-80 bg-card border border-border shadow-elevated rounded-2xl overflow-hidden pointer-events-auto"
          style={{
            left: Math.min(position.x, window.innerWidth - 340),
            top: Math.min(position.y + 20, window.innerHeight - 400),
          }}
          onMouseLeave={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>

          {/* Product Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={product.images?.[0] || 'https://placehold.co/400x300?text=Woodzire'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="absolute top-3 left-3 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded">
                Sale
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {product.category}
            </span>
            <h3 className="font-display text-lg text-foreground mt-1 mb-2 line-clamp-1">
              {product.name}
            </h3>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-display text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {product.wood_type && (
              <p className="text-xs text-muted-foreground mb-4">
                <span className="text-foreground">Material:</span> {product.wood_type}
              </p>
            )}

            {/* Stock Status */}
            <div className="mb-4">
              {product.stock_quantity > 0 ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  In Stock
                </span>
              ) : product.is_made_to_order ? (
                <span className="text-xs text-gold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  Made to Order
                </span>
              ) : (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0 && !product.is_made_to_order}
                className="flex-1 py-3 bg-charcoal text-white text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-2 rounded-lg hover:bg-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart size={14} />
                {isAdding ? 'Added!' : 'Add to Cart'}
              </motion.button>
              
              <Link to={`/product/${product.id}`}>
                <motion.button
                  className="px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={14} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;
