import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Minus, Check, Heart, Share2, Truck, Shield, RefreshCw, Package, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useUserWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCreateStockAlert } from '@/hooks/useStockAlert';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import Navigation from '@/components/Navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const ProductPage = () => {
  const { id } = useParams();
  const { data: products = [], isLoading } = useProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Wishlist hooks
  const { data: wishlistItems = [] } = useUserWishlist(user?.id);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const createStockAlert = useCreateStockAlert();
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        category: product.category,
      });
    }
  }, [product?.id]);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '');

  const isInWishlist = wishlistItems.some(item => item.product_id === id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to your wishlist',
        variant: 'destructive',
      });
      return;
    }

    if (isInWishlist) {
      const wishlistItem = wishlistItems.find(item => item.product_id === id);
      if (wishlistItem) {
        removeFromWishlist.mutate({ id: wishlistItem.id, userId: user.id });
      }
    } else if (id) {
      addToWishlist.mutate({ userId: user.id, productId: id });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading product...</div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Package size={64} className="mx-auto text-muted-foreground mb-6" />
            <h1 className="font-display text-3xl mb-4 text-foreground">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/shop">
              <motion.button
                className="px-8 py-4 bg-gold text-primary-foreground font-medium text-sm tracking-wide rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Return to Shop
              </motion.button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
      woodType: product.wood_type || 'Wood',
      maxStock: product.stock_quantity,
    }, quantity);
    
    setIsAdded(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#b8860b', '#daa520', '#cd853f'],
    });

    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <main className="pt-24 bg-background min-h-screen">
        {/* Split Layout: 60% Images / 40% Details */}
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Images (60%) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-[60%]"
          >
            {/* Scrollable Images */}
            <div className="space-y-1">
              {product.images?.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="aspect-[4/5] bg-muted"
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              ))}
              {(!product.images || product.images.length === 0) && (
                <div className="aspect-[4/5] bg-muted flex items-center justify-center">
                  <Package size={64} className="text-muted-foreground" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Side - Product Details (40%) - Sticky */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-[40%] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
          >
            <div className="p-8 lg:p-12 xl:p-16 space-y-8">
              {/* Back Link */}
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs tracking-[0.15em] uppercase"
              >
                <ChevronLeft size={14} />
                Back to Shop
              </Link>

              {/* Category */}
              <span className="block text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {product.category}
              </span>
              
              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-4">
                <p className="font-display text-2xl text-foreground">
                  {formatPrice(product.price)}
                </p>
                {product.compare_at_price && (
                  <p className="text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price)}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed tracking-wide">
                {product.description}
              </p>

              {product.wood_type && (
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  Wood: <span className="text-foreground">{product.wood_type}</span>
                </p>
              )}

              {/* Stock Status */}
              <p className={`text-xs tracking-[0.15em] uppercase ${product.stock_quantity > 0 || product.is_made_to_order ? 'text-green-600' : 'text-red-600'}`}>
                {product.is_made_to_order 
                  ? `Made to Order (${product.prep_time_days || 7} days)` 
                  : product.stock_quantity > 0 
                    ? `${product.stock_quantity} in stock` 
                    : 'Out of stock'}
              </p>

              {/* Delivery Estimate */}
              {(product.stock_quantity > 0 || product.is_made_to_order) && (
                <div className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-xl">
                  <Truck size={18} className="text-gold" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Estimated Delivery: {
                        (product.is_made_to_order ? (product.prep_time_days || 7) : 0) + 
                        ((product as any).estimated_delivery_days || 3)
                      } days
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.is_made_to_order && (
                        <span>Processing: {product.prep_time_days || 7} days + </span>
                      )}
                      Shipping: {(product as any).estimated_delivery_days || 3} days
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {(product.stock_quantity > 0 || product.is_made_to_order) && (
                <div className="flex items-center gap-6 py-6 border-y border-border">
                  <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Quantity</span>
                  <div className="flex items-center border-b border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:text-foreground text-muted-foreground transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-display text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(product.is_made_to_order ? quantity + 1 : Math.min(product.stock_quantity, quantity + 1))}
                      className="p-3 hover:text-foreground text-muted-foreground transition-colors"
                      aria-label="Increase quantity"
                      disabled={!product.is_made_to_order && quantity >= product.stock_quantity}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Notify Me Form */}
              {product.stock_quantity === 0 && !product.is_made_to_order && (
                <div className="py-6 space-y-4">
                  <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    Get notified when back in stock
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-0 py-3 bg-transparent border-0 border-b border-border text-foreground text-sm focus:border-foreground"
                    />
                    <motion.button
                      onClick={() => {
                        if (notifyEmail && id) {
                          createStockAlert.mutate({ productId: id, email: notifyEmail });
                        }
                      }}
                      disabled={!notifyEmail || createStockAlert.isPending}
                      className="px-6 py-3 bg-charcoal text-white text-xs tracking-[0.15em] uppercase disabled:opacity-50"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Bell size={14} />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Add to Cart - Full Width Black CTA */}
              {(product.stock_quantity > 0 || product.is_made_to_order) ? (
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`btn-cta-full flex items-center justify-center gap-3 ${
                    isAdded ? 'bg-green-600' : ''
                  }`}
                  whileTap={{ scale: 0.99 }}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      Added to Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </motion.button>
              ) : (
                <div className="btn-cta-full text-center opacity-50 cursor-not-allowed">
                  Out of Stock
                </div>
              )}

              {/* Secondary Actions */}
              <div className="flex gap-4">
                <motion.button
                  onClick={handleToggleWishlist}
                  className={`flex-1 py-4 border-b text-xs tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2 ${
                    isInWishlist 
                      ? 'border-foreground text-foreground' 
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {isInWishlist ? 'Saved' : 'Save'}
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    navigator.share?.({
                      title: product.name,
                      url: window.location.href,
                    });
                  }}
                  className="flex-1 py-4 border-b border-border text-muted-foreground text-xs tracking-[0.15em] uppercase hover:border-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={14} />
                  Share
                </motion.button>
              </div>

              {/* Details Accordion */}
              <Accordion type="single" collapsible className="border-t border-border">
                {product.dimensions && (
                  <AccordionItem value="dimensions" className="border-b border-border">
                    <AccordionTrigger className="text-xs tracking-[0.15em] uppercase py-6 hover:no-underline">
                      Dimensions
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      <div className="space-y-2">
                        {typeof product.dimensions === 'object' && (
                          <>
                            {(product.dimensions as any).height && <p>Height: {(product.dimensions as any).height}</p>}
                            {(product.dimensions as any).width && <p>Width: {(product.dimensions as any).width}</p>}
                            {(product.dimensions as any).depth && <p>Depth: {(product.dimensions as any).depth}</p>}
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.care_instructions && (
                  <AccordionItem value="care" className="border-b border-border">
                    <AccordionTrigger className="text-xs tracking-[0.15em] uppercase py-6 hover:no-underline">
                      Care Instructions
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      {product.care_instructions}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.shipping_info && (
                  <AccordionItem value="shipping" className="border-b border-border">
                    <AccordionTrigger className="text-xs tracking-[0.15em] uppercase py-6 hover:no-underline">
                      Shipping
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      {product.shipping_info}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section-luxury bg-alabaster">
            <div className="container mx-auto px-8">
              <h2 className="font-display text-3xl text-center mb-16">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct, idx) => (
                  <Link 
                    key={relatedProduct.id} 
                    to={`/product/${relatedProduct.id}`}
                    className="group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="image-zoom"
                    >
                      <div className="aspect-[3/4] bg-muted">
                        <img
                          src={relatedProduct.images?.[0] || '/placeholder.svg'}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-sm">{relatedProduct.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{formatPrice(relatedProduct.price)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProductPage;
