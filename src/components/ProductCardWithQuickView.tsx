import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import ProductQuickView from './ProductQuickView';

interface ProductCardWithQuickViewProps {
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

const ProductCardWithQuickView = ({ product, index = 0, featured = false }: ProductCardWithQuickViewProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewPosition, setQuickViewPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    // Delay showing quick view to avoid accidental triggers
    hoverTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setQuickViewPosition({
          x: rect.right + 10,
          y: rect.top,
        });
        setShowQuickView(true);
      }
    }, 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Small delay before hiding to allow moving to quick view
    setTimeout(() => setShowQuickView(false), 100);
  }, []);

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1] 
        }}
        className={`card-editorial group ${featured ? 'row-span-2' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

            {/* Quick View Indicator */}
            <motion.div
              className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs tracking-wide text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: showQuickView ? 1 : 0, y: showQuickView ? 0 : -10 }}
            >
              Quick View
            </motion.div>
          </div>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isVisible={showQuickView}
        position={quickViewPosition}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCardWithQuickView;
