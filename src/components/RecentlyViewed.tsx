import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const RecentlyViewed = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <Clock size={20} className="text-muted-foreground" />
            <h2 className="font-display text-2xl md:text-3xl">Recently Viewed</h2>
          </motion.div>
          
          <motion.button
            onClick={clearRecentlyViewed}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={14} />
            Clear
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {recentlyViewed.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="relative aspect-square overflow-hidden bg-muted mb-4">
                  <img
                    src={product.image || 'https://placehold.co/400x400?text=Woodzire'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {product.category}
                </span>
                <h3 className="font-display text-lg mt-1 group-hover:text-gold transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
