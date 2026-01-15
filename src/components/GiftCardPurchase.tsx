import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Send, Loader2, Check, Copy, ArrowRight, CreditCard } from 'lucide-react';
import { useCreateGiftCard } from '@/hooks/useGiftCards';
import { useNavigate } from 'react-router-dom';
import { usePaymentSettings } from '@/hooks/useSiteSettings';

const GIFT_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const GiftCardPurchase = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [createdCard, setCreatedCard] = useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'details' | 'payment'>('details');
  
  const createGiftCard = useCreateGiftCard();
  const { data: settings } = usePaymentSettings();

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const isValidAmount = finalAmount >= 100 && finalAmount <= 50000;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail);

  const handleProceedToPayment = () => {
    if (!isValidAmount || !isValidEmail) return;
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    if (!isValidAmount || !isValidEmail) return;

    try {
      const card = await createGiftCard.mutateAsync({
        amount: finalAmount,
        purchaserEmail,
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        message: message || undefined,
      });
      
      setCreatedCard({ code: card.code, amount: card.initial_balance });
    } catch (err) {
      // Error handled by mutation
    }
  };

  const copyCode = () => {
    if (createdCard) {
      navigator.clipboard.writeText(createdCard.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUPI = () => {
    if (settings?.upi_id) {
      navigator.clipboard.writeText(settings.upi_id);
    }
  };

  if (createdCard) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        
        <h2 className="font-display text-3xl mb-4">Gift Card Created!</h2>
        <p className="text-muted-foreground mb-8">
          Your {formatPrice(createdCard.amount)} gift card is ready
        </p>
        
        <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 rounded-2xl p-8 mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Gift Card Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl tracking-widest text-foreground">{createdCard.code}</span>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-gold/20 rounded-lg transition-colors"
            >
              {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-muted-foreground" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {recipientEmail ? `An email has been sent to ${recipientEmail}` : 'Share this code with your recipient'}
          </p>
        </div>
        
        <motion.button
          onClick={() => navigate('/shop')}
          className="btn-pill inline-flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Shopping
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    );
  }

  if (step === 'payment') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={() => setStep('details')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowRight size={16} className="rotate-180" />
          Back to Details
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-gold" />
          </div>
          <h2 className="font-display text-3xl mb-2">Complete Payment</h2>
          <p className="text-muted-foreground">Pay {formatPrice(finalAmount)} for your gift card</p>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-display text-lg mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gift Card Value</span>
              <span className="font-medium">{formatPrice(finalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Email</span>
              <span className="font-medium">{purchaserEmail}</span>
            </div>
            {recipientEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Send to</span>
                <span className="font-medium">{recipientName || recipientEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-display text-lg mb-4">Payment Method</h3>
          
          {settings?.upi_enabled && (
            <div className="p-4 bg-muted/50 rounded-xl mb-4">
              <p className="font-medium mb-2">UPI Payment</p>
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg">
                <span className="flex-1 font-mono text-sm">{settings.upi_id}</span>
                <button
                  onClick={handleCopyUPI}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Copy UPI ID and pay using any UPI app, then click "Confirm Payment"
              </p>
            </div>
          )}

          {settings?.cod_enabled && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium mb-2">Pay Later</p>
              <p className="text-sm text-muted-foreground">
                Gift card will be activated upon payment confirmation
              </p>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <motion.button
          onClick={handleConfirmPayment}
          disabled={createGiftCard.isPending}
          className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-gold"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {createGiftCard.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Check size={18} />
              Confirm Payment & Get Gift Card
            </>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Gift size={32} className="text-gold" />
        </div>
        <h1 className="font-display text-4xl mb-4">Woodzire Gift Card</h1>
        <p className="text-muted-foreground">
          The perfect gift for wood craft lovers
        </p>
      </div>

      {/* Amount Selection */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-display text-lg mb-4">Select Amount</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {GIFT_AMOUNTS.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedAmount === amount && !customAmount
                  ? 'bg-charcoal text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {formatPrice(amount)}
            </motion.button>
          ))}
        </div>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Or enter custom amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
              }}
              placeholder="500 - 50,000"
              min={100}
              max={50000}
              className="w-full bg-background border border-border pl-8 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>
        </div>
      </div>

      {/* Purchaser Info */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-display text-lg mb-4">Your Details</h3>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Your Email *</label>
          <input
            type="email"
            value={purchaserEmail}
            onChange={(e) => setPurchaserEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>
      </div>

      {/* Recipient Info (Optional) */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-display text-lg mb-4">Send to Someone (Optional)</h3>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Their name"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="their@email.com"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Personal Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note..."
              rows={3}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Summary & Proceed */}
      <div className="bg-charcoal text-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/70">Gift Card Value</span>
          <span className="font-display text-2xl">{formatPrice(finalAmount)}</span>
        </div>
        
        <motion.button
          onClick={handleProceedToPayment}
          disabled={!isValidAmount || !isValidEmail}
          className="w-full py-4 bg-gold text-charcoal font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <CreditCard size={18} />
          Proceed to Payment
        </motion.button>
        
        <p className="text-xs text-white/50 text-center mt-4">
          Gift cards never expire and can be used on any purchase
        </p>
      </div>
    </div>
  );
};

export default GiftCardPurchase;