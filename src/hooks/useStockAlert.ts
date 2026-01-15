import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useCreateStockAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, email }: { productId: string; email: string }) => {
      const { data, error } = await supabase
        .from('stock_alerts')
        .insert({
          product_id: productId,
          user_email: email,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You are already subscribed to notifications for this product.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast({ 
        title: 'Notification set!', 
        description: 'We\'ll email you when this product is back in stock.' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Notice', description: error.message, variant: 'default' });
    },
  });
};

export const useStockAlerts = () => {
  return useQuery({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*, products(name, stock_quantity)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useNotifyBackInStock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, productName, stockQuantity }: { productId: string; productName: string; stockQuantity: number }) => {
      // Get all unnotified alerts for this product
      const { data: alerts, error: alertsError } = await supabase
        .from('stock_alerts')
        .select('id, user_email')
        .eq('product_id', productId)
        .eq('notified', false);

      if (alertsError) throw alertsError;
      if (!alerts || alerts.length === 0) return { notified: 0 };

      // Send notification emails
      const emails = alerts.map(a => a.user_email);
      
      await supabase.functions.invoke('send-order-notification', {
        body: {
          type: 'stock_update',
          product: {
            id: productId,
            name: productName,
            stock_quantity: stockQuantity,
          },
          emails,
        },
      });

      // Mark alerts as notified
      const alertIds = alerts.map(a => a.id);
      const { error: updateError } = await supabase
        .from('stock_alerts')
        .update({ notified: true })
        .in('id', alertIds);

      if (updateError) throw updateError;

      return { notified: alerts.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      if (data.notified > 0) {
        toast({
          title: 'Notifications Sent',
          description: `${data.notified} customer(s) notified about restock.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAutoRestockCheck = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Get low stock products
      const { data: lowStockProducts, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, low_stock_threshold')
        .filter('stock_quantity', 'lte', 'low_stock_threshold');

      if (error) throw error;

      // Send admin alert for low stock
      for (const product of lowStockProducts || []) {
        await supabase.functions.invoke('send-order-notification', {
          body: {
            type: 'admin_alert',
            product: {
              id: product.id,
              name: product.name,
              stock_quantity: product.stock_quantity,
            },
          },
        });
      }

      return { count: lowStockProducts?.length || 0 };
    },
    onSuccess: (data) => {
      if (data.count > 0) {
        toast({
          title: 'Low Stock Alert',
          description: `${data.count} product(s) are running low on stock.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
