import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, Trash2, Eye, Search, Loader2 } from 'lucide-react';
import { useReviews, useUpdateReview, useDeleteReview, Review } from '@/hooks/useReviews';
import { format } from 'date-fns';

const ReviewsTab = () => {
  const { data: reviews = [], isLoading } = useReviews();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !review.is_approved) ||
      (filterStatus === 'approved' && review.is_approved);
    
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id: string) => {
    updateReview.mutate({ id, is_approved: true });
  };

  const handleReject = (id: string) => {
    updateReview.mutate({ id, is_approved: false });
  };

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    updateReview.mutate({ id, is_featured: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview.mutate(id);
    }
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display">Reviews</h2>
          <p className="text-muted-foreground">
            {pendingCount > 0 && <span className="text-amber-600">{pendingCount} pending approval</span>}
            {pendingCount === 0 && 'All reviews approved'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-charcoal text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No reviews found
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border rounded-xl p-6 ${
                !review.is_approved ? 'border-amber-300' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{review.customer_name}</span>
                    <span className="text-muted-foreground text-sm">{review.customer_email}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  <p className="text-muted-foreground mb-3">{review.content}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                    <span className={`px-2 py-1 rounded ${
                      review.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {review.is_featured && (
                      <span className="px-2 py-1 rounded bg-gold/20 text-gold">Featured</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {review.is_approved && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                      title="Unapprove"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.is_featured 
                        ? 'bg-gold/20 text-gold' 
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title={review.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
