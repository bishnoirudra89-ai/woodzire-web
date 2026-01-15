import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Payment Settings
export interface PaymentSettings {
  cod_enabled: boolean;
  upi_enabled: boolean;
  razorpay_enabled: boolean;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  upi_id: string;
  gst_percentage: number;
  domestic_shipping_threshold: number;
  domestic_shipping_charge: number;
  international_shipping_charge: number;
}

export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'payment_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'payment_settings')
        .maybeSingle();

      if (error) throw error;
      
      const defaultSettings: PaymentSettings = {
        cod_enabled: false,
        upi_enabled: true,
        razorpay_enabled: false,
        razorpay_key_id: '',
        razorpay_key_secret: '',
        upi_id: 'woodzire@upi',
        gst_percentage: 18,
        domestic_shipping_threshold: 2000,
        domestic_shipping_charge: 99,
        international_shipping_charge: 999,
      };
      
      return { ...defaultSettings, ...(data?.value as unknown as Partial<PaymentSettings>) };
    },
  });
};

export const useUpdatePaymentSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: PaymentSettings) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'payment_settings')
        .maybeSingle();

      const settingsJson = settings as unknown as { [key: string]: string | boolean | number };

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: settingsJson })
          .eq('key', 'payment_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'payment_settings', value: settingsJson }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Settings Saved', description: 'Payment settings updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'payment_settings'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Promotional Banners
export interface PromotionalBanner {
  id: string;
  message: string;
  link: string | null;
  is_active: boolean;
  is_sticky: boolean;
  background_color: string | null;
  text_color: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const usePromotionalBanners = () => {
  return useQuery({
    queryKey: ['promotional-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromotionalBanner[];
    },
  });
};

export const useActiveBanner = () => {
  return useQuery({
    queryKey: ['promotional-banners', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PromotionalBanner | null;
    },
  });
};

export const useCreateBanner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banner: Omit<PromotionalBanner, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('promotional_banners').insert(banner);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner Created' });
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateBanner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PromotionalBanner> & { id: string }) => {
      const { error } = await supabase.from('promotional_banners').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner Updated' });
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteBanner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promotional_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner Deleted' });
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Scheduled Sales
export interface ScheduledSale {
  id: string;
  name: string;
  discount_percentage: number;
  sale_type: 'all' | 'category' | 'products';
  target_category: string | null;
  target_product_ids: string[] | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export const useScheduledSales = () => {
  return useQuery({
    queryKey: ['scheduled-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_sales')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as ScheduledSale[];
    },
  });
};

export const useCreateScheduledSale = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: Omit<ScheduledSale, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('scheduled_sales').insert(sale);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Scheduled Sale Created' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-sales'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateScheduledSale = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduledSale> & { id: string }) => {
      const { error } = await supabase.from('scheduled_sales').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sale Updated' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-sales'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteScheduledSale = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_sales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sale Deleted' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-sales'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
