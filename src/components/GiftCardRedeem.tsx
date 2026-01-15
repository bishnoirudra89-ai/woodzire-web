import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, X, Loader2 } from 'lucide-react';
import { useGiftCardByCode, useRedeemGiftCard } from '@/hooks/useGiftCards';

interface GiftCardRedeemProps {
  onApply: (discount: number, code: string) => void;
  maxAmount: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const GiftCardRedeem = ({ onApply, maxAmount }: GiftCardRedeemProps) => {
  const [code, setCode] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [appliedAmount, setAppliedAmount] = useState(0);
  
  const { data: giftCard, isLoading, error } = useGiftCardByCode(code);
  const redeemMutation = useRedeemGiftCard();

  const handleApply = async () => {
    if (!giftCard || isApplied) return;

    const amountToApply = Math.min(giftCard.current_balance, maxAmount);
    
    try {
      await redeemMutation.mutateAsync({
        code: giftCard.code,
        amount: amountToApply,
      });
      
      setIsApplied(true);
      setAppliedAmount(amountToApply);
      onApply(amountToApply, giftCard.code);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleRemove = () => {
    setCode('');
    setIsApplied(false);
    setAppliedAmount(0);
    onApply(0, '');
  };

  const isValidCode = code.length >= 10;
  const hasBalance = giftCard && giftCard.current_balance > 0;

  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={18} className="text-gold" />
        <span className="text-sm font-medium">Gift Card</span>
      </div>

      {isApplied ? (
        <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Gift card applied</p>
              <p className="text-xs text-green-600">-{formatPrice(appliedAmount)}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded transition-colors"
          >
            <X size={16} className="text-green-600" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter gift card code"
              className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              maxLength={14}
            />
            <motion.button
              onClick={handleApply}
              disabled={!isValidCode || !hasBalance || isLoading || redeemMutation.isPending}
              className="px-4 py-2 bg-charcoal text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading || redeemMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Apply'
              )}
            </motion.button>
          </div>

          {isValidCode && giftCard && (
            <div className="mt-3 bg-gold/10 rounded-lg p-3">
              <p className="text-sm text-foreground">
                Balance: <span className="font-semibold text-gold">{formatPrice(giftCard.current_balance)}</span>
              </p>
              {giftCard.current_balance < maxAmount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Remaining amount will be charged separately
                </p>
              )}
            </div>
          )}

          {isValidCode && !isLoading && !giftCard && (
            <p className="text-xs text-destructive mt-2">
              Gift card not found or has no balance
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default GiftCardRedeem;
