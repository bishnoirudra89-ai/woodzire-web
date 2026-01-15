import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Loader2, Save, Eye, EyeOff, QrCode, Banknote, Percent, Truck } from 'lucide-react';
import { usePaymentSettings, useUpdatePaymentSettings, PaymentSettings } from '@/hooks/useSiteSettings';

const SettingsTab = () => {
  const { data: settings, isLoading } = usePaymentSettings();
  const updateSettings = useUpdatePaymentSettings();

  const [form, setForm] = useState<PaymentSettings>({
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
  });

  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        cod_enabled: settings.cod_enabled ?? false,
        upi_enabled: settings.upi_enabled ?? true,
        razorpay_enabled: settings.razorpay_enabled ?? false,
        razorpay_key_id: settings.razorpay_key_id ?? '',
        razorpay_key_secret: settings.razorpay_key_secret ?? '',
        upi_id: settings.upi_id ?? 'woodzire@upi',
        gst_percentage: settings.gst_percentage ?? 18,
        domestic_shipping_threshold: settings.domestic_shipping_threshold ?? 2000,
        domestic_shipping_charge: settings.domestic_shipping_charge ?? 99,
        international_shipping_charge: settings.international_shipping_charge ?? 999,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading settings...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Settings className="text-gold" size={24} />
          Site Settings
        </h2>
      </div>

      {/* Payment Settings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-6 flex items-center gap-2">
          <CreditCard className="text-gold" size={20} />
          Payment Methods
        </h3>

        <div className="space-y-4">
          {/* UPI Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              <QrCode className="text-muted-foreground" size={20} />
              <div>
                <p className="font-medium">UPI Payment</p>
                <p className="text-sm text-muted-foreground">Allow payment via UPI QR code</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.upi_enabled}
                onChange={(e) => setForm({ ...form, upi_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Razorpay Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              <CreditCard className="text-muted-foreground" size={20} />
              <div>
                <p className="font-medium">Razorpay</p>
                <p className="text-sm text-muted-foreground">Accept cards, UPI, wallets via Razorpay</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.razorpay_enabled}
                onChange={(e) => setForm({ ...form, razorpay_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* COD Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Banknote className="text-muted-foreground" size={20} />
              <div>
                <p className="font-medium">Cash on Delivery (COD)</p>
                <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.cod_enabled}
                onChange={(e) => setForm({ ...form, cod_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>
        </div>
      </div>

      {/* GST & Tax Settings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-6 flex items-center gap-2">
          <Percent className="text-gold" size={20} />
          Tax Settings
        </h3>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">GST Percentage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.gst_percentage}
            onChange={(e) => setForm({ ...form, gst_percentage: parseFloat(e.target.value) || 0 })}
            className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            placeholder="18"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This will be applied to all orders at checkout.
          </p>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-6 flex items-center gap-2">
          <Truck className="text-gold" size={20} />
          Delivery Charges
        </h3>

        <div className="space-y-6">
          {/* Free Shipping Threshold */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
            <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              min="0"
              value={form.domestic_shipping_threshold}
              onChange={(e) => setForm({ ...form, domestic_shipping_threshold: parseInt(e.target.value) || 0 })}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="2000"
            />
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              Domestic orders above this amount get FREE shipping.
            </p>
          </div>

          {/* Delivery Charges Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* In India */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🇮🇳</span>
                <label className="font-medium text-blue-800 dark:text-blue-200">In India (Domestic)</label>
              </div>
              <input
                type="number"
                min="0"
                value={form.domestic_shipping_charge}
                onChange={(e) => setForm({ ...form, domestic_shipping_charge: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="99"
              />
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Delivery charge for orders within India
              </p>
            </div>

            {/* Out of India */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🌍</span>
                <label className="font-medium text-purple-800 dark:text-purple-200">Out of India (International)</label>
              </div>
              <input
                type="number"
                min="0"
                value={form.international_shipping_charge}
                onChange={(e) => setForm({ ...form, international_shipping_charge: parseInt(e.target.value) || 0 })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="999"
              />
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                Flat rate for all international orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Settings */}
      {form.upi_enabled && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-lg mb-6 flex items-center gap-2">
            <QrCode className="text-gold" size={20} />
            UPI Settings
          </h3>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">UPI ID</label>
            <input
              type="text"
              value={form.upi_id}
              onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="yourname@upi"
            />
          </div>
        </div>
      )}

      {/* Razorpay Settings */}
      {form.razorpay_enabled && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-lg mb-6 flex items-center gap-2">
            <CreditCard className="text-gold" size={20} />
            Razorpay Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Razorpay Key ID</label>
              <input
                type="text"
                value={form.razorpay_key_id}
                onChange={(e) => setForm({ ...form, razorpay_key_id: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="rzp_live_xxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Razorpay Key Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={form.razorpay_key_secret}
                  onChange={(e) => setForm({ ...form, razorpay_key_secret: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 pr-12 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keep this secret safe. Never share it publicly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="w-full py-4 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {updateSettings.isPending ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        Save Settings
      </motion.button>
    </motion.div>
  );
};

export default SettingsTab;
