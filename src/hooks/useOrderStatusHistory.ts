import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export const useOrderStatusHistory = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrderStatusHistory[];
    },
    enabled: !!orderId,
  });
};
