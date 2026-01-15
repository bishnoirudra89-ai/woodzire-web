import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PackagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const generateOrderNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WZ-${datePart}-${randomPart}`;
};

const ManualOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    totalPrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalPriceNum = parseFloat(formData.totalPrice);
      if (isNaN(totalPriceNum) || totalPriceNum <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid total price',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Generate random order number (format: WZ-YYYYMMDD-XXXX)
      const orderNumber = generateOrderNumber();

      // Insert order with minimal required fields
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          total: totalPriceNum,
          subtotal: totalPriceNum,
          shipping_cost: 0,
          tax: 0,
          status: 'pending',
          order_number: orderNumber, // Will be overridden by trigger if empty, but we set it anyway
          shipping_address: {
            street: 'Manual Order',
            city: '',
            state: '',
            country: '',
            postalCode: '',
          } as unknown as import('@/integrations/supabase/types').Json,
          billing_address: null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Order Created',
        description: `Order ${orderNumber} has been created successfully.`,
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        totalPrice: '',
      });

      // Invalidate orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
            <PackagePlus className="text-gold" size={24} />
          </div>
          <div>
            <h2 className="font-display text-lg">Create Manual Order</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manually insert a new order into the system
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Customer Email *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Total Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
              required
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder="0.00"
            />
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-muted-foreground">
              <strong>Note:</strong> The order will be created with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Status: <span className="text-foreground font-medium">pending</span></li>
              <li>Order Number: <span className="text-foreground font-medium">Auto-generated</span></li>
              <li>Shipping Cost: <span className="text-foreground font-medium">₹0</span></li>
              <li>Tax: <span className="text-foreground font-medium">₹0</span></li>
            </ul>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gold text-primary-foreground font-medium text-sm rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating Order...
              </>
            ) : (
              <>
                <PackagePlus size={18} />
                Create Order
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ManualOrder;
