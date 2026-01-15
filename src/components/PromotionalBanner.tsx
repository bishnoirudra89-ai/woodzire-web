import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActiveBanner } from '@/hooks/useSiteSettings';

const PromotionalBanner = () => {
  const { data: banner } = useActiveBanner();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!banner || isDismissed) return null;

  const content = (
    <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium">
      <span>{banner.message}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDismissed(true);
        }}
        className="p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`w-full z-50 ${banner.is_sticky ? 'fixed top-0 left-0 right-0' : ''}`}
        style={{
          backgroundColor: banner.background_color || '#B8860B',
          color: banner.text_color || '#FFFFFF',
        }}
      >
        {banner.link ? (
          banner.link.startsWith('http') ? (
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
              {content}
            </a>
          ) : (
            <Link to={banner.link}>{content}</Link>
          )
        ) : (
          content
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionalBanner;
