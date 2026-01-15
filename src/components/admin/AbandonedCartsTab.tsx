import { motion } from 'framer-motion';
import { ShoppingCart, Mail, Trash2, Loader2, Clock, CheckCircle } from 'lucide-react';
import { useAbandonedCarts, useSendCartReminder, useDeleteAbandonedCart } from '@/hooks/useAbandonedCarts';
import { formatDistanceToNow } from 'date-fns';

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const AbandonedCartsTab = () => {
  const { data: carts = [], isLoading } = useAbandonedCarts();
  const sendReminder = useSendCartReminder();
  const deleteCart = useDeleteAbandonedCart();

  const activeCarts = carts.filter((c) => !c.recovered);
  const recoveredCarts = carts.filter((c) => c.recovered);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading abandoned carts...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Abandoned Carts</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Active: <span className="text-foreground font-medium">{activeCarts.length}</span>
          </span>
          <span className="text-muted-foreground">
            Recovered: <span className="text-green-600 font-medium">{recoveredCarts.length}</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Total Potential Revenue</p>
          <p className="font-display text-2xl text-gold mt-1">
            {formatINR(activeCarts.reduce((sum, c) => sum + c.total_amount, 0))}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Recovery Rate</p>
          <p className="font-display text-2xl text-green-600 mt-1">
            {carts.length > 0 ? Math.round((recoveredCarts.length / carts.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">Avg. Cart Value</p>
          <p className="font-display text-2xl mt-1">
            {formatINR(activeCarts.length > 0 ? activeCarts.reduce((sum, c) => sum + c.total_amount, 0) / activeCarts.length : 0)}
          </p>
        </div>
      </div>

      {/* Active Carts */}
      {activeCarts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No abandoned carts found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-medium">Active Abandoned Carts</h3>
          </div>
          <div className="divide-y divide-border">
            {activeCarts.map((cart) => (
              <div key={cart.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{cart.user_email}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(cart.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cart.cart_items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {cart.cart_items.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{cart.cart_items.length - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gold font-medium">{formatINR(cart.total_amount)}</span>
                      {cart.reminder_sent_count > 0 && (
                        <span className="text-muted-foreground">
                          {cart.reminder_sent_count} reminder{cart.reminder_sent_count > 1 ? 's' : ''} sent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => sendReminder.mutate(cart.id)}
                      disabled={sendReminder.isPending}
                      className="px-3 py-2 text-sm bg-gold/10 text-gold hover:bg-gold/20 rounded-lg transition-colors flex items-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sendReminder.isPending ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                      Send Reminder
                    </motion.button>
                    <motion.button
                      onClick={() => deleteCart.mutate(cart.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovered Carts */}
      {recoveredCarts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-green-800">
            <CheckCircle size={20} />
            Recovered Carts ({recoveredCarts.length})
          </h3>
          <div className="space-y-2">
            {recoveredCarts.slice(0, 5).map((cart) => (
              <div key={cart.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-green-700">{cart.user_email}</span>
                <span className="text-sm font-medium text-green-800">{formatINR(cart.total_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AbandonedCartsTab;
