import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, ShoppingBag } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
  featured?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductCard = ({ product, index = 0, featured = false }: ProductCardProps) => {
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { addToCart } = useCart();

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
      woodType: product.wood_type || 'Wood',
      maxStock: product.stock_quantity,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`card-editorial group ${featured ? 'row-span-2' : ''}`}
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        {/* Image Container with Zoom Effect */}
        <div className="image-zoom relative h-full min-h-[400px]">
          <img
            src={product.images?.[0] || 'https://placehold.co/600x800?text=Woodzire'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          {/* Quick Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <motion.button
              onClick={handleCompareClick}
              className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                isInCompare(product.id)
                  ? 'bg-gold text-charcoal'
                  : 'bg-white/80 text-charcoal hover:bg-gold hover:text-charcoal'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isInCompare(product.id) ? 'Remove from compare' : 'Add to compare'}
            >
              <Scale size={18} />
            </motion.button>
            <motion.button
              onClick={handleAddToCart}
              className="p-3 rounded-full bg-white/80 text-charcoal hover:bg-charcoal hover:text-white backdrop-blur-sm transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Add to cart"
            >
              <ShoppingBag size={18} />
            </motion.button>
          </div>

          {/* Product Info Overlay - Only visible on hover */}
          <div className="product-overlay">
            <span className="text-white/60 text-xs tracking-[0.2em] uppercase mb-2">
              {product.category}
            </span>
            <h3 className="font-display text-2xl text-white mb-2">
              {product.name}
            </h3>
            <p className="text-white text-lg tracking-wide">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
