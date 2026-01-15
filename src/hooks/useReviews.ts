import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string | null;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  content: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });
};

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId,
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Review updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Review deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete review', variant: 'destructive' });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'is_approved' | 'is_featured'>) => {
      const { error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          is_approved: false,
          is_featured: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ 
        title: 'Review Submitted', 
        description: 'Your review will be visible after approval.' 
      });
    },
    onError: () => {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    },
  });
};
