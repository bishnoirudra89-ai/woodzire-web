import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ShippingAddress {
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number | null;
  shipping_cost: number | null;
  total: number;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress | null;
  tracking_number: string | null;
  carrier_name: string | null;
  est_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

const transformOrder = (data: any): Order => ({
  ...data,
  shipping_address: data.shipping_address as ShippingAddress,
  billing_address: data.billing_address as ShippingAddress | null,
});

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformOrder);
    },
  });
};

export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformOrder);
    },
    enabled: !!userId,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformOrder(data) : null;
    },
    enabled: !!id,
  });
};

export const useOrderByNumber = (orderNumber: string) => {
  return useQuery({
    queryKey: ['orders', 'number', orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error) throw error;
      return data ? transformOrder(data) : null;
    },
    enabled: !!orderNumber,
  });
};
