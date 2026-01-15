import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Mail, Copy, Check, X, Twitter, Facebook } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserWishlist, WishlistItem } from '@/hooks/useWishlist';
import { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

interface WishlistShareProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistShare = ({ isOpen, onClose }: WishlistShareProps) => {
  const { user } = useAuth();
  const { data: wishlist = [] } = useUserWishlist(user?.id);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState('');

  const generateShareLink = () => {
    const productIds = wishlist.map(w => w.product_id).join(',');
    return `${window.location.origin}/shop?wishlist=${productIds}`;
  };

  const generateShareText = () => {
    const items = wishlist
      .filter(w => w.product)
      .map(w => `• ${w.product!.name} - ₹${w.product!.price}`)
      .join('\n');
    return `Check out my Woodzire wishlist:\n\n${items}\n\nView: ${generateShareLink()}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copied!' });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Check out my Woodzire wishlist!');
    const body = encodeURIComponent(generateShareText());
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out my wishlist from @Woodzire! ${generateShareLink()}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(generateShareLink());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (wishlist.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Share2 className="text-gold" size={24} />
                <h2 className="font-display text-xl">Share Wishlist</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Items Preview */}
            <div className="mb-6 p-4 bg-muted rounded-xl max-h-32 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">{wishlist.length} items</p>
              <div className="flex gap-2 flex-wrap">
                {wishlist.slice(0, 4).map((item) => (
                  <img
                    key={item.id}
                    src={item.product?.images?.[0] || '/placeholder.svg'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ))}
                {wishlist.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-sm text-muted-foreground">
                    +{wishlist.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generateShareLink()}
                  readOnly
                  className="flex-1 bg-muted border-0 px-4 py-3 rounded-xl text-sm text-muted-foreground"
                />
                <motion.button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-charcoal text-white rounded-xl flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </motion.button>
              </div>
            </div>

            {/* Social Share */}
            <div className="mb-6">
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Share via
              </label>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleTwitterShare}
                  className="flex-1 p-3 bg-[#1DA1F2] text-white rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Twitter size={20} />
                </motion.button>
                <motion.button
                  onClick={handleFacebookShare}
                  className="flex-1 p-3 bg-[#4267B2] text-white rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Facebook size={20} />
                </motion.button>
                <motion.button
                  onClick={handleWhatsAppShare}
                  className="flex-1 p-3 bg-[#25D366] text-white rounded-xl flex items-center justify-center text-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Email Share */}
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Send via Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="friend@email.com"
                  className="flex-1 bg-muted border-0 px-4 py-3 rounded-xl text-sm"
                />
                <motion.button
                  onClick={handleEmailShare}
                  disabled={!emailTo}
                  className="px-4 py-3 bg-gold text-charcoal rounded-xl flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistShare;
