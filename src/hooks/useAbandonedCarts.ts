import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AbandonedCart {
  id: string;
  user_id: string | null;
  user_email: string;
  cart_items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total_amount: number;
  reminder_sent_count: number;
  last_reminder_sent_at: string | null;
  recovered: boolean;
  created_at: string;
  updated_at: string;
}

export const useAbandonedCarts = () => {
  return useQuery({
    queryKey: ['abandoned-carts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AbandonedCart[];
    },
  });
};

export const useSaveAbandonedCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id?: string;
      user_email: string;
      cart_items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }>;
      total_amount: number;
    }) => {
      // Check if there's an existing cart for this email
      const { data: existing } = await supabase
        .from('abandoned_carts')
        .select('id')
        .eq('user_email', data.user_email)
        .eq('recovered', false)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('abandoned_carts')
          .update({
            cart_items: data.cart_items as any,
            total_amount: data.total_amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
        return existing.id;
      } else {
        const { data: newCart, error } = await supabase
          .from('abandoned_carts')
          .insert({
            user_id: data.user_id,
            user_email: data.user_email,
            cart_items: data.cart_items as any,
            total_amount: data.total_amount,
          })
          .select('id')
          .single();
        if (error) throw error;
        return newCart.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    },
  });
};

export const useMarkCartRecovered = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ recovered: true })
        .eq('user_email', data.email)
        .eq('recovered', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    },
  });
};

export const useSendCartReminder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      const { data: cart, error: fetchError } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('id', cartId)
        .single();

      if (fetchError) throw fetchError;

      // Call edge function to send reminder email
      const { error: invokeError } = await supabase.functions.invoke('send-cart-reminder', {
        body: {
          email: cart.user_email,
          cartItems: cart.cart_items,
          totalAmount: cart.total_amount,
        },
      });

      if (invokeError) throw invokeError;

      // Update reminder count
      const { error: updateError } = await supabase
        .from('abandoned_carts')
        .update({
          reminder_sent_count: (cart.reminder_sent_count || 0) + 1,
          last_reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', cartId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({ title: 'Reminder Sent', description: 'Cart reminder email has been sent.' });
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteAbandonedCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('abandoned_carts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cart Removed', description: 'Abandoned cart has been removed.' });
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
