import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, CheckCircle, Loader2, Copy, Check, Banknote } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { usePaymentSettings } from '@/hooks/useSiteSettings';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const { data: paymentSettings } = usePaymentSettings();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay' | 'cod'>('upi');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Get order details from location state
  const orderData = location.state?.orderData;
  const giftCardDiscount = location.state?.giftCardDiscount || 0;
  const shippingCost = location.state?.shippingCost || 0;
  const tax = location.state?.tax || 0;
  const grandTotal = location.state?.grandTotal || (totalPrice + shippingCost + tax - giftCardDiscount);

  const upiId = paymentSettings?.upi_id || 'woodzire@upi';
  const codEnabled = paymentSettings?.cod_enabled ?? false;
  const upiEnabled = paymentSettings?.upi_enabled ?? true;
  const razorpayEnabled = paymentSettings?.razorpay_enabled ?? false;

  // Set default payment method based on what's enabled
  useEffect(() => {
    if (upiEnabled) {
      setPaymentMethod('upi');
    } else if (razorpayEnabled) {
      setPaymentMethod('razorpay');
    } else if (codEnabled) {
      setPaymentMethod('cod');
    }
  }, [upiEnabled, razorpayEnabled, codEnabled]);

  useEffect(() => {
    if (!orderData && items.length === 0) {
      navigate('/shop');
    }
  }, [orderData, items, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'UPI ID Copied', description: upiId });
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    // Simulate payment verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPaymentConfirmed(true);
    setIsProcessing(false);
    clearCart();
    toast({ title: 'Payment Confirmed', description: 'Your order has been placed successfully!' });
  };

  const handleCODOrder = async () => {
    setIsProcessing(true);
    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPaymentConfirmed(true);
    setIsProcessing(false);
    clearCart();
    toast({ title: 'Order Placed', description: 'Your COD order has been placed successfully!' });
  };

  // Generate UPI payment link with amount
  const upiPaymentLink = `upi://pay?pa=${upiId}&pn=Woodzire&am=${grandTotal}&cu=INR&tn=Order Payment`;

  if (paymentConfirmed) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen bg-gradient-warm">
          <div className="container mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h1 className="font-display text-3xl mb-4 text-foreground">
                {paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
              </h1>
              <p className="text-muted-foreground mb-8">
                {paymentMethod === 'cod' 
                  ? 'Thank you for your order. You will pay upon delivery.'
                  : 'Thank you for your order. You will receive a confirmation email shortly with your invoice.'
                }
              </p>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gold text-primary-foreground font-medium rounded-xl shadow-gold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View My Orders
              </motion.button>
            </motion.div>
          </div>
          <Footer />
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-24 min-h-screen bg-gradient-warm">
        <div className="container mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-8 shadow-card"
            >
              <h1 className="font-display text-2xl mb-8 text-center">Complete Payment</h1>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-xl p-6 mb-8">
                <h3 className="font-medium mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {giftCardDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Gift Card Discount</span>
                      <span>-{formatPrice(giftCardDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-xl pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              {(() => {
                const enabledMethods = [];
                if (upiEnabled) enabledMethods.push('upi');
                if (razorpayEnabled) enabledMethods.push('razorpay');
                if (codEnabled) enabledMethods.push('cod');
                const cols = enabledMethods.length;
                
                return (
                  <div className={`grid gap-4 mb-8 grid-cols-${cols}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {upiEnabled && (
                      <motion.button
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'upi' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <QrCode size={28} className={paymentMethod === 'upi' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
                        <p className="text-sm font-medium">UPI / QR Code</p>
                      </motion.button>
                    )}
                    {razorpayEnabled && (
                      <motion.button
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'razorpay' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CreditCard size={28} className={paymentMethod === 'razorpay' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
                        <p className="text-sm font-medium">Razorpay</p>
                      </motion.button>
                    )}
                    {codEnabled && (
                      <motion.button
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Banknote size={28} className={paymentMethod === 'cod' ? 'text-gold mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
                        <p className="text-sm font-medium">Cash on Delivery</p>
                      </motion.button>
                    )}
                  </div>
                );
              })()}

              {/* UPI Payment */}
              {paymentMethod === 'upi' && (
                <div className="text-center">
                  {/* QR Code placeholder - would be generated dynamically */}
                  <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center border border-border">
                    <div className="text-center">
                      <QrCode size={100} className="text-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground mt-2">Scan with any UPI app</p>
                    </div>
                  </div>

                  <p className="text-lg font-display text-gold mb-4">{formatPrice(grandTotal)}</p>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-sm text-muted-foreground">UPI ID:</span>
                    <code className="bg-muted px-3 py-1 rounded-lg text-sm font-mono">{upiId}</code>
                    <motion.button
                      onClick={handleCopyUPI}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-muted-foreground" />}
                    </motion.button>
                  </div>

                  <a
                    href={upiPaymentLink}
                    className="inline-block w-full max-w-xs px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors mb-4"
                  >
                    Pay with UPI App
                  </a>

                  <p className="text-sm text-muted-foreground mb-6">
                    After completing payment, click the button below to confirm
                  </p>

                  <motion.button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        I've Completed Payment
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Razorpay Payment */}
              {paymentMethod === 'razorpay' && (
                <div className="text-center">
                  {paymentSettings?.razorpay_key_id ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <CreditCard size={48} className="text-blue-600 mx-auto mb-4" />
                        <h3 className="font-display text-lg text-blue-800 mb-2">Pay with Card/UPI/Wallet</h3>
                        <p className="text-sm text-blue-700">
                          Securely pay using Razorpay. Supports all major cards, UPI, and wallets.
                        </p>
                      </div>
                      <motion.button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Pay {formatPrice(grandTotal)}
                          </>
                        )}
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                        <CreditCard size={48} className="text-amber-600 mx-auto mb-4" />
                        <h3 className="font-display text-lg text-amber-800 mb-2">Razorpay Not Configured</h3>
                        <p className="text-sm text-amber-700">
                          Razorpay payment gateway is not configured yet. Please use UPI payment for now.
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setPaymentMethod('upi')}
                        className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Switch to UPI Payment
                      </motion.button>
                    </>
                  )}
                </div>
              )}

              {/* COD Payment */}
              {paymentMethod === 'cod' && (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <Banknote size={48} className="text-green-600 mx-auto mb-4" />
                    <h3 className="font-display text-lg text-green-800 mb-2">Cash on Delivery</h3>
                    <p className="text-sm text-green-700">
                      Pay with cash when your order is delivered. A verification call may be made before dispatch.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted-foreground">Amount to pay on delivery:</p>
                    <p className="font-display text-2xl text-gold">{formatPrice(grandTotal)}</p>
                  </div>

                  <motion.button
                    onClick={handleCODOrder}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Place COD Order
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Payment;
