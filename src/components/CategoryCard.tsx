import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
    >
      <Link 
        to={`/shop?category=${category.id}`} 
        className="group block relative overflow-hidden aspect-[4/5] card-luxury"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay Gradient - Darker for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20 opacity-90 group-hover:opacity-85 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl tracking-wider mb-2 group-hover:text-gold transition-colors text-foreground drop-shadow-lg">
              {category.name}
            </h3>
            <p className="text-sm text-foreground/80 mb-4 line-clamp-2 drop-shadow-md">
              {category.description}
            </p>
            <span className="inline-flex items-center gap-2 text-xs text-gold tracking-widest uppercase">
              Explore Collection
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
              >
                →
              </motion.span>
            </span>
          </motion.div>
        </div>

        {/* Gold Border Reveal */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-colors duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
