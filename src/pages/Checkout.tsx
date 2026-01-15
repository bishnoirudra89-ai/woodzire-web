import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, CheckCircle, Loader2, ShoppingBag, Shield, Truck, Globe } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { usePaymentSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import GiftCardRedeem from '@/components/GiftCardRedeem';
import { z } from 'zod';

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'United Arab Emirates',
  'Japan',
  'Other',
];

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const createOrder = useCreateOrder();
  const { data: settings } = usePaymentSettings();
  
  const [step, setStep] = useState<'address' | 'review' | 'success'>('address');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [appliedGiftCardCode, setAppliedGiftCardCode] = useState('');
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    notes: '',
  });

  // Calculate shipping based on country and settings
  const isInternational = formData.country !== 'India';
  const gstPercentage = settings?.gst_percentage ?? 18;
  const domesticThreshold = settings?.domestic_shipping_threshold ?? 2000;
  const domesticShipping = settings?.domestic_shipping_charge ?? 99;
  const internationalShipping = settings?.international_shipping_charge ?? 999;
  
  const shippingCost = isInternational 
    ? internationalShipping 
    : (totalPrice >= domesticThreshold ? 0 : domesticShipping);
  
  const tax = Math.round(totalPrice * (gstPercentage / 100));
  const subtotalAfterGiftCard = Math.max(0, totalPrice - giftCardDiscount);
  const grandTotal = subtotalAfterGiftCard + shippingCost + tax;

  const handleGiftCardApply = (discount: number, code: string) => {
    setGiftCardDiscount(discount);
    setAppliedGiftCardCode(code);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateAddress = () => {
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleContinueToReview = () => {
    if (validateAddress()) {
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await createOrder.mutateAsync({
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
        },
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: totalPrice,
        shippingCost,
        tax,
        total: grandTotal,
        notes: formData.notes,
      });
      
      clearCart();
      setStep('success');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl mb-4 text-foreground">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">Add some items to your cart to proceed with checkout</p>
              <Link to="/shop">
                <motion.button
                  className="px-8 py-4 bg-gold text-primary-foreground font-medium text-sm rounded-xl shadow-gold"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </div>
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
          {/* Back button */}
          {step !== 'success' && (
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Continue Shopping</span>
            </Link>
          )}

          {/* Progress Steps */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className={`flex items-center gap-2 ${step === 'address' ? 'text-gold' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                  step === 'address' ? 'border-gold bg-gold/10' : 'border-border'
                }`}>
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Shipping</span>
              </div>
              <div className="w-16 h-0.5 bg-border rounded-full" />
              <div className={`flex items-center gap-2 ${step === 'review' ? 'text-gold' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                  step === 'review' ? 'border-gold bg-gold/10' : 'border-border'
                }`}>
                  <CreditCard size={18} />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Review & Pay</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 'address' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-8 shadow-card"
                >
                  <h2 className="font-display text-2xl mb-8 text-foreground">Shipping Address</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.fullName ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.email ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.phone ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.streetAddress ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="House no, Street name, Area"
                      />
                      {errors.streetAddress && <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.city ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.state ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="State"
                      />
                      {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full bg-background border ${errors.postalCode ? 'border-red-400' : 'border-border'} px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all`}
                        placeholder="6 digit PIN code"
                      />
                      {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {isInternational && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <Globe size={14} />
                          <span>International shipping: {formatPrice(internationalShipping)}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Order Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any special instructions for your order..."
                        className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={handleContinueToReview}
                    className="w-full mt-8 py-4 bg-gold text-primary-foreground font-medium text-sm rounded-xl hover:bg-gold-light transition-all shadow-gold"
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Continue to Review
                  </motion.button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Shipping Address Summary */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg text-foreground">Shipping Address</h3>
                      <button 
                        onClick={() => setStep('address')}
                        className="text-sm text-gold hover:underline font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-muted-foreground text-sm space-y-1">
                      <p className="text-foreground font-medium">{formData.fullName}</p>
                      <p>{formData.streetAddress}</p>
                      <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                      <p>{formData.country}</p>
                      <p className="pt-2">{formData.email}</p>
                      <p>{formData.phone}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                    <h3 className="font-display text-lg mb-6 text-foreground">Order Items</h3>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-display text-gold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield size={20} className="text-gold" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg mb-2 text-foreground">Payment</h3>
                        <p className="text-sm text-muted-foreground">
                          Cash on Delivery (COD) available. Pay when your order arrives.
                          Online payment options coming soon!
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                    className="w-full py-4 bg-gold text-primary-foreground font-medium text-sm rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
                    whileHover={{ scale: createOrder.isPending ? 1 : 1.02 }}
                    whileTap={{ scale: createOrder.isPending ? 1 : 0.98 }}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order • ${formatPrice(grandTotal)}`
                    )}
                  </motion.button>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <CheckCircle className="text-green-500" size={48} />
                  </motion.div>
                  <h1 className="font-display text-3xl mb-4 text-foreground">Order Placed Successfully!</h1>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Thank you for your order. We'll send you a confirmation email with tracking details soon.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard">
                      <motion.button
                        className="px-8 py-4 bg-gold text-primary-foreground font-medium text-sm rounded-xl shadow-gold"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View My Orders
                      </motion.button>
                    </Link>
                    <Link to="/shop">
                      <motion.button
                        className="px-8 py-4 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue Shopping
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {step !== 'success' && (
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-card sticky top-32">
                  <h3 className="font-display text-lg mb-6 text-foreground">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gift Card Redemption */}
                  <div className="mb-6">
                    <GiftCardRedeem 
                      onApply={handleGiftCardApply} 
                      maxAmount={totalPrice + shippingCost + tax} 
                    />
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    {giftCardDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gift Card</span>
                        <span className="text-green-600">-{formatPrice(giftCardDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shipping {isInternational ? '(International)' : '(Domestic)'}
                      </span>
                      <span className={shippingCost === 0 ? 'text-green-600' : 'text-foreground'}>
                        {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST ({gstPercentage}%)</span>
                      <span className="text-foreground">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-display pt-3 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-gold">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {shippingCost === 0 && (
                    <div className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-xl">
                      <Truck size={16} />
                      <span>You've unlocked free shipping!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default Checkout;
