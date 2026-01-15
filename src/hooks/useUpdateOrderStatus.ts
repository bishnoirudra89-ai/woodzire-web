import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrierName?: string;
  estDeliveryDate?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundMethod?: string;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status, trackingNumber, carrierName, estDeliveryDate, cancellationReason, refundAmount, refundMethod }: UpdateOrderStatusData) => {
      const updateData: Record<string, unknown> = { status };
      
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      if (carrierName !== undefined) updateData.carrier_name = carrierName;
      if (estDeliveryDate !== undefined) updateData.est_delivery_date = estDeliveryDate;

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select(`
          *,
          order_items (*)
        `)
        .single();

      if (error) throw error;

      // Send email notification for status changes
      if (status === 'shipped' || status === 'delivered') {
        try {
          await supabase.functions.invoke('send-order-notification', {
            body: {
              type: 'status_change',
              order: {
                order_number: data.order_number,
                customer_name: data.customer_name,
                customer_email: data.customer_email,
                status,
                tracking_number: data.tracking_number,
                carrier_name: data.carrier_name,
                est_delivery_date: data.est_delivery_date,
                shipping_address: data.shipping_address,
              },
            },
          });
        } catch (e) {
          console.error('Failed to send status change notification:', e);
        }
      }

      // Send cancellation email with reason and refund info
      if (status === 'cancelled') {
        try {
          await supabase.functions.invoke('send-order-notification', {
            body: {
              type: 'order_cancelled',
              order: {
                order_number: data.order_number,
                customer_name: data.customer_name,
                customer_email: data.customer_email,
                total: data.total,
                items: data.order_items?.map((item: { product_name: string; quantity: number; unit_price: number; total_price: number }) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.total_price,
                })),
                cancellation_reason: cancellationReason,
                refund_amount: refundAmount,
                refund_method: refundMethod,
              },
            },
          });
        } catch (e) {
          console.error('Failed to send cancellation notification:', e);
        }
      }

      // Send push notification for all status changes
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            type: 'order_status_change',
            order_id: orderId,
            old_status: null,
            new_status: status,
          },
        });
      } catch (e) {
        console.error('Failed to send push notification:', e);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-history'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-history-admin'] });
      toast({ 
        title: 'Order updated', 
        description: `Order ${data.order_number} status changed to ${data.status}.` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
