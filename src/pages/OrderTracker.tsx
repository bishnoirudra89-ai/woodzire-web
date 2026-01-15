import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  ArrowLeft,
  AlertCircle,
  History
} from 'lucide-react';
import { useOrderByNumber } from '@/hooks/useOrders';
import { useOrderStatusHistory } from '@/hooks/useOrderStatusHistory';
import Footer from '@/components/Footer';
import ShipmentMap from '@/components/ShipmentMap';

const ORDER_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'preparing', label: 'Preparing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const OrderTracker = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrderNumber, setSearchedOrderNumber] = useState('');
  
  const { data: order, isLoading, error } = useOrderByNumber(searchedOrderNumber);
  const { data: statusHistory } = useOrderStatusHistory(order?.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchedOrderNumber(orderNumber.trim().toUpperCase());
    }
  };

  const getStepIndex = (status: string) => {
    const index = ORDER_STEPS.findIndex(step => step.id === status);
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <main className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Store</span>
          </Link>
          <h1 className="font-display text-xl text-foreground">Track Your Order</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-foreground mb-3">Track Your Order</h2>
            <p className="text-muted-foreground">Enter your order number to see the current status</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., WZ-250104-A1B2)"
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <motion.button
              type="submit"
              className="px-8 py-4 bg-gold text-primary-foreground font-medium rounded-xl shadow-gold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Track
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">Looking up your order...</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-destructive" size={32} />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">Please check the order number and try again.</p>
          </motion.div>
        )}

        {searchedOrderNumber && !isLoading && !error && !order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-muted-foreground" size={32} />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">No order found with number "{searchedOrderNumber}"</p>
          </motion.div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Order Header */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl text-foreground">{order.order_number}</h3>
                  <p className="text-muted-foreground">
                    Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-gold">{formatINR(order.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length || 0} items
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {isCancelled ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 mb-8 text-center">
                <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
                <h3 className="font-display text-xl text-destructive mb-2">Order Cancelled</h3>
                <p className="text-muted-foreground">This order has been cancelled.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 shadow-card mb-8">
                <h4 className="font-display text-lg text-foreground mb-8">Order Status</h4>
                
                {/* Vertical Timeline */}
                <div className="relative">
                  {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    // Find the history entry for this status
                    const historyEntry = statusHistory?.find(h => h.status === step.id);

                    return (
                      <div key={step.id} className="flex items-start gap-4 pb-8 last:pb-0">
                        {/* Line */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted 
                                ? 'bg-gold border-gold text-primary-foreground' 
                                : 'bg-muted border-border text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-gold/20' : ''}`}
                          >
                            <Icon size={20} />
                          </motion.div>
                          {index < ORDER_STEPS.length - 1 && (
                            <div className={`w-0.5 h-12 ${isCompleted && index < currentStepIndex ? 'bg-gold' : 'bg-border'}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </h5>
                            {historyEntry && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(historyEntry.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          {isCurrent && (
                            <p className="text-sm text-gold font-medium mt-1">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History */}
            {statusHistory && statusHistory.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
                <h4 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <History size={20} className="text-gold" />
                  Status History
                </h4>
                <div className="space-y-3">
                  {statusHistory.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-4 text-sm">
                      <div className={`w-2 h-2 rounded-full ${index === statusHistory.length - 1 ? 'bg-gold' : 'bg-muted-foreground/50'}`} />
                      <div className="flex-1">
                        <span className="capitalize font-medium text-foreground">{entry.status}</span>
                        {entry.notes && (
                          <span className="text-muted-foreground ml-2">- {entry.notes}</span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(entry.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
                <h4 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-gold" />
                  Tracking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium text-foreground">{order.carrier_name || 'Standard Shipping'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium text-foreground font-mono">{order.tracking_number}</p>
                  </div>
                  {order.est_delivery_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Delivery</p>
                      <p className="font-medium text-foreground">
                        {new Date(order.est_delivery_date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
              <h4 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-gold" />
                Shipping Address
              </h4>
              <div className="text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">{order.customer_name}</p>
                <p>{order.shipping_address.street_address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h4 className="font-display text-lg text-foreground mb-6">Order Items</h4>
              <div className="space-y-4">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-display text-gold">{formatINR(item.total_price)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatINR(order.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatINR(order.tax || 0)}</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-gold">{formatINR(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Live Tracking Map */}
            {order.status === 'shipped' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card mt-8">
                <h4 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-gold" />
                  Live Tracking
                </h4>
                <ShipmentMap 
                  destinationAddress={{
                    city: order.shipping_address.city,
                    state: order.shipping_address.state,
                    country: order.shipping_address.country,
                  }}
                  carrierName={order.carrier_name}
                />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  * Location shown is approximate based on carrier updates
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default OrderTracker;
