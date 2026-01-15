import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: BundleItem[];
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export const useBundles = () => {
  return useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Bundle[];
    },
  });
};

export const useBundleWithItems = (bundleId: string) => {
  return useQuery({
    queryKey: ['bundle', bundleId],
    queryFn: async () => {
      const { data: bundle, error: bundleError } = await supabase
        .from('product_bundles')
        .select('*')
        .eq('id', bundleId)
        .single();
      if (bundleError) throw bundleError;

      const { data: items, error: itemsError } = await supabase
        .from('bundle_items')
        .select('*, product:products(id, name, price, images)')
        .eq('bundle_id', bundleId);
      if (itemsError) throw itemsError;

      return { ...bundle, items } as Bundle;
    },
    enabled: !!bundleId,
  });
};

export const useActiveBundles = () => {
  return useQuery({
    queryKey: ['bundles', 'active'],
    queryFn: async () => {
      const { data: bundles, error: bundlesError } = await supabase
        .from('product_bundles')
        .select('*')
        .eq('is_active', true);
      if (bundlesError) throw bundlesError;

      const bundlesWithItems = await Promise.all(
        bundles.map(async (bundle) => {
          const { data: items } = await supabase
            .from('bundle_items')
            .select('*, product:products(id, name, price, images)')
            .eq('bundle_id', bundle.id);
          return { ...bundle, items: items || [] };
        })
      );

      return bundlesWithItems as Bundle[];
    },
  });
};

export const useCreateBundle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      discount_percentage: number;
      is_active: boolean;
      productIds: string[];
    }) => {
      const { data: bundle, error: bundleError } = await supabase
        .from('product_bundles')
        .insert({
          name: data.name,
          description: data.description,
          discount_percentage: data.discount_percentage,
          is_active: data.is_active,
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      if (data.productIds.length > 0) {
        const bundleItems = data.productIds.map((productId) => ({
          bundle_id: bundle.id,
          product_id: productId,
          quantity: 1,
        }));

        const { error: itemsError } = await supabase
          .from('bundle_items')
          .insert(bundleItems);

        if (itemsError) throw itemsError;
      }

      return bundle;
    },
    onSuccess: () => {
      toast({ title: 'Bundle Created', description: 'Product bundle has been created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateBundle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      discount_percentage?: number;
      is_active?: boolean;
      productIds?: string[];
    }) => {
      const { id, productIds, ...updateData } = data;

      const { error: bundleError } = await supabase
        .from('product_bundles')
        .update(updateData)
        .eq('id', id);

      if (bundleError) throw bundleError;

      if (productIds !== undefined) {
        // Delete existing items
        await supabase.from('bundle_items').delete().eq('bundle_id', id);

        // Insert new items
        if (productIds.length > 0) {
          const bundleItems = productIds.map((productId) => ({
            bundle_id: id,
            product_id: productId,
            quantity: 1,
          }));

          const { error: itemsError } = await supabase
            .from('bundle_items')
            .insert(bundleItems);

          if (itemsError) throw itemsError;
        }
      }

      return data;
    },
    onSuccess: () => {
      toast({ title: 'Bundle Updated', description: 'Product bundle has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteBundle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_bundles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Bundle Deleted', description: 'Product bundle has been deleted.' });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
