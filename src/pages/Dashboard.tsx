import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, Package, MapPin, Heart, LogOut, Settings, Trash2, Share2, Truck, Calendar, ChevronRight, Scale, Bell } from 'lucide-react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { useUserOrders } from '@/hooks/useOrders';
import { useUserAddresses, useDeleteAddress } from '@/hooks/useAddresses';
import { useUserWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import WishlistShare from '@/components/WishlistShare';
import NotificationSettings from '@/components/NotificationSettings';

const Dashboard = () => {
  const { user, profile, isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [showWishlistShare, setShowWishlistShare] = useState(false);
  const { addToCart } = useCart();

  // Fetch real data
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(user?.id);
  const { data: addresses = [], isLoading: addressesLoading } = useUserAddresses(user?.id);
  const { data: wishlist = [], isLoading: wishlistLoading } = useUserWishlist(user?.id);
  
  const deleteAddress = useDeleteAddress();
  const removeFromWishlist = useRemoveFromWishlist();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const tabs = [
    { id: 'orders', name: 'My Orders', icon: Package },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'preparing':
        return 'text-amber-600 bg-amber-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <Navigation />
      <main className="pt-24">
        <section className="py-16 bg-card">
          <div className="container mx-auto px-6">
            <motion.div
              className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User size={28} className="text-gold" />
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-wider">Welcome, {displayName}</h1>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-muted text-gold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="text-sm tracking-wider">{tab.name}</span>
                    </button>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-muted/50"
                    >
                      <Settings size={18} />
                      <span className="text-sm tracking-wider">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <LogOut size={18} />
                    <span className="text-sm tracking-wider">Sign Out</span>
                  </button>
                </nav>
              </aside>

              {/* Content */}
              <div className="flex-1">
                {activeTab === 'orders' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-display text-xl tracking-wider mb-6">Order History</h2>
                    {ordersLoading ? (
                      <div className="animate-pulse text-muted-foreground">Loading orders...</div>
                    ) : orders.length === 0 ? (
                      <div className="text-muted-foreground border border-border rounded-2xl p-12 text-center">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-4">No orders yet</p>
                        <Link to="/shop" className="btn-pill inline-block">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <motion.div 
                            key={order.id} 
                            className="border border-border rounded-2xl overflow-hidden bg-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {/* Order Header */}
                            <div className="p-6 border-b border-border">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="font-display text-lg tracking-wider">{order.order_number}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <Link 
                                    to={`/track?order=${order.order_number}`}
                                    className="text-sm text-gold hover:underline flex items-center gap-1"
                                  >
                                    Track Order <ChevronRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                              <div className="space-y-4 mb-6">
                                {order.order_items?.map((item, i) => (
                                  <div key={i} className="flex items-center gap-4">
                                    {item.product_image && (
                                      <img 
                                        src={item.product_image} 
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium">{item.product_name}</p>
                                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-gold">{formatPrice(item.total_price)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Tracking Info */}
                              {order.tracking_number && (
                                <div className="bg-muted rounded-xl p-4 mb-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Truck size={18} className="text-gold" />
                                    <span className="text-sm font-medium">Shipment Details</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    {order.carrier_name && (
                                      <div>
                                        <p className="text-muted-foreground">Carrier</p>
                                        <p className="font-medium">{order.carrier_name}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-muted-foreground">Tracking No.</p>
                                      <p className="font-mono font-medium">{order.tracking_number}</p>
                                    </div>
                                    {order.est_delivery_date && (
                                      <div>
                                        <p className="text-muted-foreground">Est. Delivery</p>
                                        <p className="font-medium flex items-center gap-1">
                                          <Calendar size={14} />
                                          {new Date(order.est_delivery_date).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Total */}
                              <div className="flex justify-between items-center pt-4 border-t border-border">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-display text-xl text-gold">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-display text-xl tracking-wider mb-6">Saved Addresses</h2>
                    {addressesLoading ? (
                      <div className="animate-pulse text-muted-foreground">Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                      <div className="text-muted-foreground border border-border rounded-2xl p-12 text-center">
                        <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No saved addresses</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="border border-border rounded-xl p-6 bg-card">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-display tracking-wider">{addr.label || 'Address'}</span>
                              <div className="flex items-center gap-2">
                                {addr.is_default && (
                                  <span className="text-xs text-gold tracking-wider uppercase px-2 py-1 bg-gold/10 rounded">Default</span>
                                )}
                                <button
                                  onClick={() => user && deleteAddress.mutate({ id: addr.id, userId: user.id })}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {addr.full_name}<br />
                              {addr.street_address}<br />
                              {addr.city}, {addr.state} {addr.postal_code}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl tracking-wider">My Wishlist</h2>
                      {wishlist.length > 0 && (
                        <motion.button
                          onClick={() => setShowWishlistShare(true)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Share2 size={16} />
                          Share Wishlist
                        </motion.button>
                      )}
                    </div>
                    {wishlistLoading ? (
                      <div className="animate-pulse text-muted-foreground">Loading wishlist...</div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-muted-foreground border border-border rounded-2xl p-12 text-center">
                        <Heart size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-4">Your wishlist is empty</p>
                        <Link to="/shop" className="btn-pill inline-block">
                          Explore Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {wishlist.map((item) => (
                          <div key={item.id} className="border border-border rounded-xl p-4 flex items-center gap-4 bg-card">
                            {item.product?.images?.[0] && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/product/${item.product_id}`}
                                className="font-display tracking-wide hover:text-gold transition-colors block truncate"
                              >
                                {item.product?.name || 'Unknown Product'}
                              </Link>
                              <p className="text-gold font-display mt-1">{formatPrice(item.product?.price || 0)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={() => {
                                  if (item.product) {
                                    addToCart({
                                      id: item.product.id,
                                      name: item.product.name,
                                      price: item.product.price,
                                      image: item.product.images?.[0] || '/placeholder.svg',
                                      woodType: item.product.wood_type || 'Wood',
                                      maxStock: item.product.stock_quantity,
                                    });
                                  }
                                }}
                                className="p-2 bg-charcoal text-white rounded-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Add to cart"
                              >
                                <Package size={16} />
                              </motion.button>
                              <button
                                onClick={() => user && removeFromWishlist.mutate({ id: item.id, userId: user.id })}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-display text-xl tracking-wider mb-6">Notification Settings</h2>
                    <NotificationSettings />
                    
                    <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                      <h3 className="text-sm font-medium mb-2">About Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable push notifications to get instant updates when your order status changes. 
                        You'll be notified when your order is being prepared, shipped, or delivered.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <WishlistShare isOpen={showWishlistShare} onClose={() => setShowWishlistShare(false)} />
    </>
  );
};

export default Dashboard;
