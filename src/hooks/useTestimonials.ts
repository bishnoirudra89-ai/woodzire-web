import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  product: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useActiveTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useCreateTestimonial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('testimonials').insert(testimonial);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Testimonial Created' });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateTestimonial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      const { error } = await supabase.from('testimonials').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Testimonial Updated' });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteTestimonial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Testimonial Deleted' });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
