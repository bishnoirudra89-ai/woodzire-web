import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Send, Loader2 } from 'lucide-react';
import { useProductReviews, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const StarRating = ({ 
  rating, 
  onRate, 
  interactive = false,
  size = 16 
}: { 
  rating: number; 
  onRate?: (rating: number) => void; 
  interactive?: boolean;
  size?: number;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          disabled={!interactive}
          className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`${
              star <= (hovered || rating)
                ? 'fill-gold text-gold'
                : 'fill-transparent text-muted-foreground/40'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const createReview = useCreateReview();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    customerName: user?.user_metadata?.full_name || '',
    customerEmail: user?.email || '',
  });

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.customerName.trim() || !formData.customerEmail.trim()) {
      return;
    }

    createReview.mutate({
      product_id: productId,
      rating: formData.rating,
      title: formData.title || null,
      content: formData.content,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      user_id: user?.id || null,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({
          rating: 5,
          title: '',
          content: '',
          customerName: user?.user_metadata?.full_name || '',
          customerEmail: user?.email || '',
        });
      }
    });
  };

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-muted-foreground text-sm">
                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowForm(!showForm)}
            className="btn-pill"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Write a Review
          </motion.button>
        </div>

        {/* Review Form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h3 className="font-display text-lg mb-6">Share Your Experience</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Your Rating *
                </label>
                <StarRating 
                  rating={formData.rating} 
                  onRate={(rating) => setFormData(prev => ({ ...prev, rating }))}
                  interactive
                  size={24}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                    className="w-full bg-background border border-border px-4 py-3 rounded-lg focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    required
                    className="w-full bg-background border border-border px-4 py-3 rounded-lg focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full bg-background border border-border px-4 py-3 rounded-lg focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Your Review *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  className="w-full bg-background border border-border px-4 py-3 rounded-lg focus:border-gold transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={createReview.isPending}
                  className="btn-pill flex items-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {createReview.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Submit Review
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-border pb-6 last:border-0"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{review.customer_name}</span>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground mb-2">{review.content}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
