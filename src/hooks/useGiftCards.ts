import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  purchaser_email: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
}

// Generate a unique gift card code
const generateGiftCardCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'WZ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useGiftCardByCode = (code: string) => {
  return useQuery({
    queryKey: ['gift-card', code],
    queryFn: async () => {
      if (!code) return null;
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data as GiftCard;
    },
    enabled: !!code && code.length >= 10,
  });
};

export const useCreateGiftCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      purchaserEmail: string;
      recipientEmail?: string;
      recipientName?: string;
      message?: string;
    }) => {
      const code = generateGiftCardCode();
      
      const { data: giftCard, error } = await supabase
        .from('gift_cards')
        .insert({
          code,
          initial_balance: data.amount,
          current_balance: data.amount,
          purchaser_email: data.purchaserEmail,
          recipient_email: data.recipientEmail,
          recipient_name: data.recipientName,
          message: data.message,
        })
        .select()
        .single();

      if (error) throw error;

      // Create purchase transaction
      await supabase.from('gift_card_transactions').insert({
        gift_card_id: giftCard.id,
        amount: data.amount,
        transaction_type: 'purchase',
      });

      // Send email to recipient if provided
      if (data.recipientEmail) {
        try {
          await supabase.functions.invoke('send-gift-card-email', {
            body: {
              recipientEmail: data.recipientEmail,
              recipientName: data.recipientName,
              purchaserEmail: data.purchaserEmail,
              code: giftCard.code,
              amount: data.amount,
              message: data.message,
            },
          });
        } catch (emailError) {
          console.error('Failed to send gift card email:', emailError);
          // Don't throw - gift card was still created successfully
        }
      }

      return giftCard as GiftCard;
    },
    onSuccess: () => {
      toast({ title: 'Gift Card Created', description: 'Gift card has been created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useRedeemGiftCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { code: string; amount: number; orderId?: string }) => {
      // First get the gift card
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', data.code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (fetchError) throw new Error('Gift card not found');
      if (!giftCard) throw new Error('Gift card not found');
      if (giftCard.current_balance < data.amount) throw new Error('Insufficient balance');
      if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        throw new Error('Gift card has expired');
      }

      const newBalance = giftCard.current_balance - data.amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({ 
          current_balance: newBalance,
          used_at: newBalance === 0 ? new Date().toISOString() : giftCard.used_at,
          is_active: newBalance > 0,
        })
        .eq('id', giftCard.id);

      if (updateError) throw updateError;

      // Create redemption transaction
      await supabase.from('gift_card_transactions').insert({
        gift_card_id: giftCard.id,
        order_id: data.orderId,
        amount: data.amount,
        transaction_type: 'redemption',
      });

      return { ...giftCard, current_balance: newBalance };
    },
    onSuccess: () => {
      toast({ title: 'Gift Card Applied', description: 'Gift card has been applied to your order.' });
      queryClient.invalidateQueries({ queryKey: ['gift-card'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAllGiftCards = () => {
  return useQuery({
    queryKey: ['gift-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GiftCard[];
    },
  });
};
