import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Users,
  TrendingUp,
  ChevronLeft,
  Save,
  Eye,
  AlertTriangle,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Download,
  FileUp,
  PackagePlus,
  Truck,
  Calendar,
  Star,
  MessageSquare,
  CheckCircle,
  Mail,
  FlaskConical,
  Gift,
  Layers,
  Percent,
  ShoppingBag,
  Settings,
  Megaphone,
  Menu,
  History,
  XCircle
} from 'lucide-react';
import WoodzireLogo from '@/components/WoodzireLogo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  Product 
} from '@/hooks/useProducts';
import { useOrders, Order } from '@/hooks/useOrders';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import { useDeleteOrder } from '@/hooks/useDeleteOrder';
import { useUpdateOrder } from '@/hooks/useUpdateOrder';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useReviews, useUpdateReview, useDeleteReview, Review } from '@/hooks/useReviews';
import { useInquiries, useMarkInquiryRead, useDeleteInquiry, Inquiry } from '@/hooks/useInquiries';
import { useActiveCategories } from '@/hooks/useCategories';
import { useNotifyBackInStock, useAutoRestockCheck } from '@/hooks/useStockAlert';
import CampaignsTab from '@/components/admin/CampaignsTab';
import EmailAnalyticsTab from '@/components/admin/EmailAnalyticsTab';
import ABTestingTab from '@/components/admin/ABTestingTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import InquiriesTab from '@/components/admin/InquiriesTab';
import BundlesTab from '@/components/admin/BundlesTab';
import SalesTab from '@/components/admin/SalesTab';
import GiftCardsTab from '@/components/admin/GiftCardsTab';
import AbandonedCartsTab from '@/components/admin/AbandonedCartsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import BannersTab from '@/components/admin/BannersTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import TestimonialsTab from '@/components/admin/TestimonialsTab';
import OrderStatusHistory from '@/components/admin/OrderStatusHistory';
import UserManagement from '@/components/admin/UserManagement';
import ManualOrder from '@/components/admin/ManualOrder';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculateEstimatedDelivery, formatDeliveryDate, AVAILABLE_CARRIERS } from '@/lib/deliveryEstimate';

const ORDER_STATUSES = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatusType = typeof ORDER_STATUSES[number];

type AdminTab = 'dashboard' | 'products' | 'orders' | 'inventory' | 'bundles' | 'sales' | 'giftcards' | 'abandoned' | 'reviews' | 'inquiries' | 'campaigns' | 'analytics' | 'abtesting' | 'banners' | 'settings' | 'categories' | 'testimonials' | 'system';

// Wood types (static)
const woodTypes = [
  'Black Walnut',
  'Cherry',
  'Maple',
  'Oak',
  'Mahogany',
  'Teak',
  'Sheesham',
  'Mango Wood',
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editShippingCost, setEditShippingCost] = useState<number>(0);
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    tracking_number: '',
    carrier_name: '',
    est_delivery_date: '',
  });
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancellationForm, setCancellationForm] = useState({
    reason: '',
    refund_amount: 0,
    refund_method: 'Original Payment Method',
  });
  const [viewingHistoryOrder, setViewingHistoryOrder] = useState<Order | null>(null);

  // Fetch real data
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: inquiries = [], isLoading: inquiriesLoading } = useInquiries();
  const { data: dbCategories = [] } = useActiveCategories();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  const { uploadImage, isUploading } = useImageUpload();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const markInquiryRead = useMarkInquiryRead();
  const deleteInquiry = useDeleteInquiry();
  const notifyBackInStock = useNotifyBackInStock();
  const autoRestockCheck = useAutoRestockCheck();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    price: 0,
    compare_at_price: null as number | null,
    description: '',
    category: 'Memorial Urns',
    wood_type: 'Black Walnut',
    images: [] as string[],
    dimensions: null as { height?: string; width?: string; depth?: string } | null,
    care_instructions: '',
    shipping_info: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    prep_time_days: 7,
    estimated_delivery_days: 3,
    delivery_charge: 0,
    international_delivery_charge: 0,
    is_made_to_order: false,
    is_on_sale: false,
    discount_percentage: 0,
    is_active: true,
    is_featured: false,
    is_trending: false,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, toast]);

  const tabs = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, name: 'Products', icon: Package },
    { id: 'categories' as const, name: 'Categories', icon: Layers },
    { id: 'orders' as const, name: 'Orders', icon: ShoppingCart },
    { id: 'inventory' as const, name: 'Inventory', icon: BarChart3 },
    { id: 'bundles' as const, name: 'Bundles', icon: Gift },
    { id: 'sales' as const, name: 'Sales', icon: Percent },
    { id: 'giftcards' as const, name: 'Gift Cards', icon: Gift },
    { id: 'abandoned' as const, name: 'Abandoned Carts', icon: ShoppingBag },
    { id: 'reviews' as const, name: 'Reviews', icon: Star },
    { id: 'testimonials' as const, name: 'Testimonials', icon: MessageSquare },
    { id: 'inquiries' as const, name: 'Inquiries', icon: MessageSquare },
    { id: 'campaigns' as const, name: 'Campaigns', icon: Mail },
    { id: 'abtesting' as const, name: 'A/B Tests', icon: FlaskConical },
    { id: 'analytics' as const, name: 'Analytics', icon: TrendingUp },
    { id: 'banners' as const, name: 'Banners', icon: Megaphone },
    { id: 'system' as const, name: 'System', icon: Settings },
    { id: 'settings' as const, name: 'Settings', icon: Settings },
  ];

  const unreadInquiries = inquiries.filter(i => !i.is_read).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;

  // Calculate real stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

  const stats = [
    { 
      label: 'Total Revenue', 
      value: formatINR(totalRevenue), 
      change: '+12.5%', 
      isPositive: true,
      icon: IndianRupee 
    },
    { 
      label: 'Orders', 
      value: totalOrders.toString(), 
      change: '+8.2%', 
      isPositive: true,
      icon: ShoppingCart 
    },
    { 
      label: 'Customers', 
      value: uniqueCustomers.toString(), 
      change: '+15.3%', 
      isPositive: true,
      icon: Users 
    },
    { 
      label: 'Products', 
      value: products.length.toString(), 
      change: '+3.1%', 
      isPositive: true,
      icon: TrendingUp 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': 
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_at_price: product.compare_at_price,
        description: product.description || '',
        category: product.category,
        wood_type: product.wood_type || 'Black Walnut',
        images: product.images || [],
        dimensions: product.dimensions,
        care_instructions: product.care_instructions || '',
        shipping_info: product.shipping_info || '',
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold || 5,
        prep_time_days: product.prep_time_days || 7,
        estimated_delivery_days: (product as any).estimated_delivery_days || 3,
        delivery_charge: product.delivery_charge || 0,
        international_delivery_charge: product.international_delivery_charge || 0,
        is_made_to_order: product.is_made_to_order ?? false,
        is_on_sale: product.is_on_sale ?? false,
        discount_percentage: product.discount_percentage || 0,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_trending: product.is_trending ?? false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        slug: '',
        price: 0,
        compare_at_price: null,
        description: '',
        category: 'Memorial Urns',
        wood_type: 'Black Walnut',
        images: [],
        dimensions: null,
        care_instructions: '',
        shipping_info: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        prep_time_days: 7,
        estimated_delivery_days: 3,
        delivery_charge: 0,
        international_delivery_charge: 0,
        is_made_to_order: false,
        is_on_sale: false,
        discount_percentage: 0,
        is_active: true,
        is_featured: false,
        is_trending: false,
      });
    }
    setIsProductModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        if (url) {
          setProductForm(prev => ({
            ...prev,
            images: [...prev.images, url],
          }));
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      ...productForm,
      slug: productForm.slug || generateSlug(productForm.name),
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...productData });
    } else {
      createProduct.mutate(productData);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(productId);
    }
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to permanently delete order ${orderNumber}? This action cannot be undone.`)) {
      deleteOrder.mutate(orderId);
    }
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditShippingCost(Number(order.shipping_cost) || 0);
  };

  const handleOpenTrackingModal = (order: Order) => {
    setTrackingModalOrder(order);
    // Calculate default estimated delivery date
    const shippingAddress = order.shipping_address as { city?: string; state?: string; country?: string } | null;
    const defaultEstDate = calculateEstimatedDelivery({
      carrierName: order.carrier_name || 'Standard Shipping',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      country: shippingAddress?.country || 'India',
    });
    
    setTrackingForm({
      tracking_number: order.tracking_number || '',
      carrier_name: order.carrier_name || 'Standard Shipping',
      est_delivery_date: order.est_delivery_date || defaultEstDate.toISOString().split('T')[0],
    });
  };

  const handleCarrierChange = (carrier: string) => {
    if (!trackingModalOrder) return;
    
    const shippingAddress = trackingModalOrder.shipping_address as { city?: string; state?: string; country?: string } | null;
    const estDate = calculateEstimatedDelivery({
      carrierName: carrier,
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      country: shippingAddress?.country || 'India',
    });
    
    setTrackingForm(prev => ({
      ...prev,
      carrier_name: carrier,
      est_delivery_date: estDate.toISOString().split('T')[0],
    }));
  };

  const handleSaveTracking = () => {
    if (!trackingModalOrder) return;
    
    updateOrderStatus.mutate({
      orderId: trackingModalOrder.id,
      status: 'shipped',
      trackingNumber: trackingForm.tracking_number,
      carrierName: trackingForm.carrier_name,
      estDeliveryDate: trackingForm.est_delivery_date,
    }, {
      onSuccess: () => {
        setTrackingModalOrder(null);
      }
    });
  };

  const handleOpenCancellationModal = (order: Order) => {
    setCancellingOrder(order);
    setCancellationForm({
      reason: '',
      refund_amount: Number(order.total),
      refund_method: 'Original Payment Method',
    });
  };

  const handleCancelOrder = () => {
    if (!cancellingOrder) return;
    
    updateOrderStatus.mutate({
      orderId: cancellingOrder.id,
      status: 'cancelled',
      cancellationReason: cancellationForm.reason,
      refundAmount: cancellationForm.refund_amount,
      refundMethod: cancellationForm.refund_method,
    }, {
      onSuccess: () => {
        setCancellingOrder(null);
        toast({
          title: 'Order Cancelled',
          description: `Order ${cancellingOrder.order_number} has been cancelled and notifications sent.`,
        });
      }
    });
  };

  const handleSaveShippingCost = () => {
    if (!editingOrder) return;
    
    const newTotal = Number(editingOrder.subtotal) + editShippingCost + (Number(editingOrder.tax) || 0);
    
    updateOrder.mutate({
      orderId: editingOrder.id,
      shipping_cost: editShippingCost,
      total: newTotal,
    }, {
      onSuccess: () => {
        setEditingOrder(null);
      }
    });
  };

  const handleExportProducts = () => {
    const csvHeaders = ['name', 'slug', 'price', 'compare_at_price', 'category', 'wood_type', 'stock_quantity', 'low_stock_threshold', 'description', 'care_instructions', 'shipping_info', 'is_active', 'is_featured', 'is_trending'];
    const csvRows = products.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.slug || '').replace(/"/g, '""')}"`,
      p.price || 0,
      p.compare_at_price || '',
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${(p.wood_type || '').replace(/"/g, '""')}"`,
      p.stock_quantity || 0,
      p.low_stock_threshold || 5,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${(p.care_instructions || '').replace(/"/g, '""')}"`,
      `"${(p.shipping_info || '').replace(/"/g, '""')}"`,
      p.is_active ?? true,
      p.is_featured ?? false,
      p.is_trending ?? false,
    ].join(','));
    
    const csv = [csvHeaders.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `woodzire-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `${products.length} products exported to CSV` });
  };

  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          
          const productData: Record<string, unknown> = {};
          headers.forEach((header, idx) => {
            const value = values[idx] || '';
            if (['price', 'compare_at_price', 'stock_quantity', 'low_stock_threshold'].includes(header)) {
              productData[header] = value ? Number(value) : (header === 'stock_quantity' ? 0 : null);
            } else if (['is_active', 'is_featured', 'is_trending'].includes(header)) {
              productData[header] = value.toLowerCase() === 'true';
            } else {
              productData[header] = value;
            }
          });

          if (productData.name && productData.category) {
            createProduct.mutate({
              name: productData.name as string,
              slug: (productData.slug as string) || generateSlug(productData.name as string),
              price: (productData.price as number) || 0,
              compare_at_price: productData.compare_at_price as number | null,
              category: productData.category as string,
              wood_type: productData.wood_type as string || null,
              stock_quantity: (productData.stock_quantity as number) || 0,
              low_stock_threshold: (productData.low_stock_threshold as number) || 5,
              prep_time_days: (productData.prep_time_days as number) || 7,
              delivery_charge: (productData.delivery_charge as number) || 0,
              international_delivery_charge: (productData.international_delivery_charge as number) || 0,
              is_made_to_order: productData.is_made_to_order as boolean ?? false,
              is_on_sale: productData.is_on_sale as boolean ?? false,
              discount_percentage: (productData.discount_percentage as number) || 0,
              description: productData.description as string || null,
              care_instructions: productData.care_instructions as string || null,
              shipping_info: productData.shipping_info as string || null,
              is_active: productData.is_active as boolean ?? true,
              is_featured: productData.is_featured as boolean ?? false,
              is_trending: productData.is_trending as boolean ?? false,
              images: [],
              dimensions: null,
            });
            imported++;
          }
        }
        toast({ title: 'Import Started', description: `Importing ${imported} products...` });
      } catch (error) {
        toast({ title: 'Import Failed', description: 'Invalid CSV format', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === orderFilter.toLowerCase());

  const lowStockProducts = products.filter(p => 
    p.stock_quantity <= (p.low_stock_threshold || 5)
  );

  const handleOpenRestockModal = (product: Product) => {
    setRestockProduct(product);
    setRestockQuantity(10); // Default restock amount
  };

  const handleRestock = () => {
    if (!restockProduct || restockQuantity <= 0) return;
    
    updateProduct.mutate({
      id: restockProduct.id,
      stock_quantity: restockProduct.stock_quantity + restockQuantity,
    }, {
      onSuccess: () => {
        toast({
          title: 'Stock Updated',
          description: `Added ${restockQuantity} units to ${restockProduct.name}`,
        });
        setRestockProduct(null);
        setRestockQuantity(0);
      }
    });
  };

  const handleQuickRestock = (product: Product, amount: number) => {
    updateProduct.mutate({
      id: product.id,
      stock_quantity: product.stock_quantity + amount,
    }, {
      onSuccess: () => {
        toast({
          title: 'Stock Updated',
          description: `Added ${amount} units to ${product.name}`,
        });
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-warm flex"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border flex flex-col shadow-soft
        transform transition-transform duration-300 lg:transform-none
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/">
            <WoodzireLogo />
          </Link>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold/10 text-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={20} />
                <span className="text-sm font-medium tracking-wide">{tab.name}</span>
              </div>
              {tab.id === 'inquiries' && unreadInquiries > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {unreadInquiries}
                </span>
              )}
              {tab.id === 'reviews' && pendingReviews > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-600 text-white rounded-full">
                  {pendingReviews}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link 
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                <Menu size={20} />
              </button>
              {/* Home button for mobile */}
              <Link
                to="/"
                className="lg:hidden p-2 text-muted-foreground hover:text-gold transition-colors"
                title="Go to Home"
              >
                <ChevronLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="font-display text-xl lg:text-2xl text-foreground truncate">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                  Manage your Woodzire store
                </p>
              </div>
            </div>
            {activeTab === 'products' && (
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  onClick={handleExportProducts}
                  className="px-3 py-2 bg-card border border-border text-foreground flex items-center gap-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
                <label className="cursor-pointer">
                  <motion.div
                    className="px-3 py-2 bg-card border border-border text-foreground flex items-center gap-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-muted transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileUp size={16} />
                    <span className="hidden sm:inline">Import</span>
                  </motion.div>
                  <input type="file" accept=".csv" onChange={handleImportProducts} className="hidden" />
                </label>
                <motion.button
                  onClick={() => handleOpenProductModal()}
                  className="px-4 py-2 bg-gold text-primary-foreground flex items-center gap-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Product</span>
                </motion.button>
              </div>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-3d bg-card p-6 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                        <stat.icon size={22} className="text-gold" />
                      </div>
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        stat.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="font-display text-2xl text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="card-luxury bg-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="font-display text-lg">Recent Orders</h2>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-gold hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="p-6 text-muted-foreground flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Loading...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-muted-foreground text-center">No orders yet</div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-foreground">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-gold">{formatINR(Number(order.total))}</p>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Alert */}
              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <p className="font-display text-lg text-amber-800">{lowStockProducts.length} products running low</p>
                      <p className="text-sm text-amber-600">
                        {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.stock_quantity} left)`).join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border pl-12 pr-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>

              {/* Products Grid */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No products match your search' : 'No products yet. Add your first product!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card-3d bg-card rounded-2xl overflow-hidden group"
                    >
                      <div className="aspect-square relative bg-muted">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <div className="flex gap-2">
                            <Link to={`/product/${product.id}`}>
                              <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                                <Eye size={18} className="text-foreground" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleOpenProductModal(product)}
                              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                            >
                              <Edit2 size={18} className="text-foreground" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-white/90 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={18} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                        <h3 className="font-display text-lg text-foreground mb-2 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="font-display text-xl text-gold">{formatINR(product.price)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.stock_quantity > (product.low_stock_threshold || 5)
                              ? 'text-green-600 bg-green-100' 
                              : product.stock_quantity > 0
                                ? 'text-amber-600 bg-amber-100'
                                : 'text-red-600 bg-red-100'
                          }`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'processing', 'shipped', 'delivered'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      orderFilter === filter
                        ? 'bg-gold text-primary-foreground shadow-gold'
                        : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin" size={18} />
                  Loading orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <motion.div 
                      key={order.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-luxury bg-card rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-lg">{order.order_number}</h3>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus.mutate({ orderId: order.id, status: e.target.value as OrderStatusType })}
                              disabled={updateOrderStatus.isPending}
                              className={`text-xs px-3 py-1.5 rounded-full capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/20 font-medium ${getStatusColor(order.status)}`}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status} className="bg-card text-foreground">
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.customer_name} • {order.customer_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl text-gold">{formatINR(Number(order.total))}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Tracking Info (if shipped) */}
                      {order.tracking_number && (
                        <div className="bg-blue-50 rounded-xl p-3 mb-4">
                          <div className="flex items-center gap-2 text-blue-700 text-sm">
                            <Truck size={16} />
                            <span className="font-medium">{order.carrier_name || 'Carrier'}</span>
                            <span className="text-blue-500">•</span>
                            <span className="font-mono">{order.tracking_number}</span>
                            {order.est_delivery_date && (
                              <>
                                <span className="text-blue-500">•</span>
                                <span>Est. {new Date(order.est_delivery_date).toLocaleDateString('en-IN')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-border pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Items:</p>
                            <div className="space-y-1">
                              {order.order_items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                                  <span className="text-gold font-medium">{formatINR(Number(item.unit_price))}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatINR(Number(order.subtotal))}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Shipping:</span>
                                <button 
                                  onClick={() => handleOpenEditOrder(order)}
                                  className="text-gold hover:underline flex items-center gap-1"
                                >
                                  {formatINR(Number(order.shipping_cost) || 0)}
                                  <Edit2 size={12} />
                                </button>
                              </div>
                              {(order.tax ?? 0) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tax:</span>
                                  <span>{formatINR(Number(order.tax))}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium pt-1">
                                <span>Total:</span>
                                <span className="text-gold">{formatINR(Number(order.total))}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="ml-4 flex flex-col gap-2">
                            {/* View History Button */}
                            <motion.button
                              onClick={() => setViewingHistoryOrder(order)}
                              className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-gold/10 flex items-center gap-1.5 text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="View Status History"
                            >
                              <History size={16} />
                              <span className="hidden sm:inline">History</span>
                            </motion.button>
                            
                            {/* Add Tracking Button */}
                            {(order.status === 'preparing' || order.status === 'pending') && (
                              <motion.button
                                onClick={() => handleOpenTrackingModal(order)}
                                className="p-2 text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50 flex items-center gap-1.5 text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Mark as Shipped"
                              >
                                <Truck size={16} />
                                <span className="hidden sm:inline">Ship</span>
                              </motion.button>
                            )}
                            
                            {/* Cancel Order Button */}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <motion.button
                                onClick={() => handleOpenCancellationModal(order)}
                                className="p-2 text-amber-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 flex items-center gap-1.5 text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Cancel Order"
                              >
                                <XCircle size={16} />
                                <span className="hidden sm:inline">Cancel</span>
                              </motion.button>
                            )}
                            
                            <motion.button
                              onClick={() => handleDeleteOrder(order.id, order.order_number)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={deleteOrder.isPending}
                              aria-label="Delete order"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-3d bg-card p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="font-display text-3xl mt-2">{products.length}</p>
                </div>
                <div className="card-3d bg-card p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="font-display text-3xl mt-2 text-green-600">
                    {products.filter(p => p.stock_quantity > (p.low_stock_threshold || 5)).length}
                  </p>
                </div>
                <div className="card-3d bg-card p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="font-display text-3xl mt-2 text-amber-600">
                    {lowStockProducts.filter(p => p.stock_quantity > 0).length}
                  </p>
                </div>
                <div className="card-3d bg-card p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="font-display text-3xl mt-2 text-red-600">
                    {products.filter(p => p.stock_quantity === 0).length}
                  </p>
                </div>
              </div>

              {/* Low Stock Alert Section */}
              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-amber-600" size={24} />
                    <h2 className="font-display text-lg text-amber-800 dark:text-amber-200">
                      Low Stock Alert ({lowStockProducts.length} products)
                    </h2>
                  </div>
                  <div className="grid gap-3">
                    {lowStockProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="bg-card rounded-xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: <span className={product.stock_quantity === 0 ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold'}>
                              {product.stock_quantity} units
                            </span>
                            {' • '}Threshold: {product.low_stock_threshold || 5}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.button
                            onClick={() => handleQuickRestock(product, 5)}
                            disabled={updateProduct.isPending}
                            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            +5
                          </motion.button>
                          <motion.button
                            onClick={() => handleQuickRestock(product, 10)}
                            disabled={updateProduct.isPending}
                            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            +10
                          </motion.button>
                          <motion.button
                            onClick={() => handleOpenRestockModal(product)}
                            disabled={updateProduct.isPending}
                            className="px-3 py-1.5 text-xs bg-gold text-primary-foreground rounded-lg hover:bg-gold-light transition-colors flex items-center gap-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <PackagePlus size={14} />
                            Restock
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto Stock Management Actions */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display text-lg mb-4">Stock Management</h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => autoRestockCheck.mutate()}
                    disabled={autoRestockCheck.isPending}
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl flex items-center gap-2 hover:bg-amber-200 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {autoRestockCheck.isPending ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                    Check Low Stock & Alert Admin
                  </motion.button>
                  
                  {lowStockProducts.some(p => p.stock_quantity > 0) && (
                    <motion.button
                      onClick={() => {
                        // Notify customers for restocked items
                        lowStockProducts.filter(p => p.stock_quantity > 0).forEach(p => {
                          notifyBackInStock.mutate({
                            productId: p.id,
                            productName: p.name,
                            stockQuantity: p.stock_quantity,
                          });
                        });
                      }}
                      disabled={notifyBackInStock.isPending}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-xl flex items-center gap-2 hover:bg-green-200 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {notifyBackInStock.isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                      Notify Customers (Back in Stock)
                    </motion.button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Use these actions to manage stock alerts and notify customers when items are restocked.
                </p>
              </div>

              {/* Inventory Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="font-display text-lg">All Stock Levels</h2>
                </div>
                {productsLoading ? (
                  <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Loading...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm text-muted-foreground">Product</th>
                          <th className="text-left p-4 font-medium text-sm text-muted-foreground">Category</th>
                          <th className="text-left p-4 font-medium text-sm text-muted-foreground">Quantity</th>
                          <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
                          <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((product) => {
                          const isLow = product.stock_quantity <= (product.low_stock_threshold || 5);
                          const isOut = product.stock_quantity === 0;
                          return (
                            <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium">{product.name}</td>
                              <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                              <td className="p-4">
                                <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-foreground'}>
                                  {product.stock_quantity} units
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  isOut ? 'text-red-600 bg-red-100' :
                                  isLow ? 'text-amber-600 bg-amber-100' : 
                                  'text-green-600 bg-green-100'
                                }`}>
                                  {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <motion.button
                                  onClick={() => handleOpenRestockModal(product)}
                                  disabled={updateProduct.isPending}
                                  className="px-3 py-1.5 text-xs bg-gold/10 text-gold hover:bg-gold/20 rounded-lg transition-colors inline-flex items-center gap-1"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <PackagePlus size={14} />
                                  Restock
                                </motion.button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bundles Tab */}
          {activeTab === 'bundles' && <BundlesTab />}

          {/* Sales Tab */}
          {activeTab === 'sales' && <SalesTab />}

          {/* Gift Cards Tab */}
          {activeTab === 'giftcards' && <GiftCardsTab />}

          {/* Abandoned Carts Tab */}
          {activeTab === 'abandoned' && <AbandonedCartsTab />}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && <ReviewsTab />}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && <InquiriesTab />}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <CampaignsTab />
          )}

          {/* A/B Testing Tab */}
          {activeTab === 'abtesting' && (
            <ABTestingTab />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <EmailAnalyticsTab />
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && <BannersTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && <SettingsTab />}

          {/* Categories Tab */}
          {activeTab === 'categories' && <CategoriesTab />}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && <TestimonialsTab />}

          {/* System Tab */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="users">User Management</TabsTrigger>
                  <TabsTrigger value="manual-order">Manual Order</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-6">
                  <UserManagement />
                </TabsContent>
                <TabsContent value="manual-order" className="mt-6">
                  <ManualOrder />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">Product Images</label>
              <div className="grid grid-cols-4 gap-3">
                {productForm.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-gold cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-gold transition-colors">
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-xs mt-2">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ 
                    ...productForm, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Delivery Charge (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.delivery_charge}
                  onChange={(e) => setProductForm({ ...productForm, delivery_charge: Number(e.target.value) })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                >
                  {dbCategories.length > 0 ? (
                    dbCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Memorial Urns">Memorial Urns</option>
                      <option value="Nautical Decors">Nautical Decors</option>
                      <option value="Yarn Winders">Yarn Winders</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Wood Type</label>
                <select
                  value={productForm.wood_type}
                  onChange={(e) => setProductForm({ ...productForm, wood_type: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                >
                  {woodTypes.map(wood => (
                    <option key={wood} value={wood}>{wood}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                  placeholder="Describe your product..."
                />
              </div>
              
              {/* Made to Order Section */}
              <div className="col-span-2 bg-muted/50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={productForm.is_made_to_order ?? false}
                    onChange={(e) => setProductForm({ ...productForm, is_made_to_order: e.target.checked })}
                    className="w-5 h-5 accent-gold rounded"
                  />
                  <span className="font-medium">Made to Order</span>
                </label>
                
                {productForm.is_made_to_order && (
                  <div className="pl-8">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Processing Time (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.prep_time_days}
                      onChange={(e) => setProductForm({ ...productForm, prep_time_days: Number(e.target.value) })}
                      className="w-32 bg-background border border-border px-4 py-2 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Time required to craft this product before shipping
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Estimated Delivery (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.estimated_delivery_days}
                    onChange={(e) => setProductForm({ ...productForm, estimated_delivery_days: Number(e.target.value) })}
                    className="w-32 bg-background border border-border px-4 py-2 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Shipping time after processing. Total = {productForm.prep_time_days + productForm.estimated_delivery_days} days
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_active ?? true}
                    onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                    className="w-5 h-5 accent-gold rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured ?? false}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-5 h-5 accent-gold rounded"
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_trending ?? false}
                    onChange={(e) => setProductForm({ ...productForm, is_trending: e.target.checked })}
                    className="w-5 h-5 accent-gold rounded"
                  />
                  <span className="text-sm">Trending</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-border">
              <motion.button
                onClick={handleSaveProduct}
                disabled={createProduct.isPending || updateProduct.isPending || isUploading}
                className="flex-1 py-3 bg-gold text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {(createProduct.isPending || updateProduct.isPending) ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </motion.button>
              <motion.button
                onClick={() => setIsProductModalOpen(false)}
                className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Modal */}
      <Dialog open={!!restockProduct} onOpenChange={() => setRestockProduct(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <PackagePlus className="text-gold" size={24} />
              Restock Product
            </DialogTitle>
          </DialogHeader>
          
          {restockProduct && (
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-medium text-lg">{restockProduct.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Current Stock: <span className="font-semibold text-foreground">{restockProduct.stock_quantity} units</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-lg"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 25, 50, 100].map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => setRestockQuantity(amount)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                      restockQuantity === amount 
                        ? 'bg-gold text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    +{amount}
                  </motion.button>
                ))}
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  New Stock Level: <span className="font-bold text-lg">{restockProduct.stock_quantity + restockQuantity} units</span>
                </p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <motion.button
                  onClick={handleRestock}
                  disabled={updateProduct.isPending || restockQuantity <= 0}
                  className="flex-1 py-3 bg-gold text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {updateProduct.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <PackagePlus size={18} />
                  )}
                  Add Stock
                </motion.button>
                <motion.button
                  onClick={() => setRestockProduct(null)}
                  className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Shipping Cost Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Edit2 className="text-gold" size={20} />
              Edit Shipping Cost
            </DialogTitle>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-medium text-lg">{editingOrder.order_number}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingOrder.customer_name} • {editingOrder.customer_email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editShippingCost}
                  onChange={(e) => setEditShippingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-lg"
                />
              </div>

              <div className="flex gap-2">
                {[0, 50, 100, 150, 200].map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => setEditShippingCost(amount)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                      editShippingCost === amount 
                        ? 'bg-gold text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ₹{amount}
                  </motion.button>
                ))}
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatINR(Number(editingOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-gold font-medium">{formatINR(editShippingCost)}</span>
                </div>
                {(editingOrder.tax ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatINR(Number(editingOrder.tax))}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span>New Total:</span>
                  <span className="text-gold text-lg">
                    {formatINR(Number(editingOrder.subtotal) + editShippingCost + (Number(editingOrder.tax) || 0))}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <motion.button
                  onClick={handleSaveShippingCost}
                  disabled={updateOrder.isPending}
                  className="flex-1 py-3 bg-gold text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {updateOrder.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </motion.button>
                <motion.button
                  onClick={() => setEditingOrder(null)}
                  className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Info Modal */}
      <Dialog open={!!trackingModalOrder} onOpenChange={() => setTrackingModalOrder(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Truck className="text-blue-600" size={20} />
              Add Tracking Information
            </DialogTitle>
          </DialogHeader>
          
          {trackingModalOrder && (
            <div className="space-y-6 py-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-medium text-lg text-foreground">{trackingModalOrder.order_number}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {trackingModalOrder.customer_name} • {trackingModalOrder.customer_email}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  This will update the status to "Shipped" and send a notification email to the customer.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Carrier Name
                </label>
                <select
                  value={trackingForm.carrier_name}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                >
                  <option value="">Select Carrier</option>
                  {AVAILABLE_CARRIERS.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Estimated Delivery Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    value={trackingForm.est_delivery_date}
                    onChange={(e) => setTrackingForm({ ...trackingForm, est_delivery_date: e.target.value })}
                    className="w-full bg-background border border-border pl-12 pr-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <motion.button
                  onClick={handleSaveTracking}
                  disabled={!trackingForm.tracking_number || updateOrderStatus.isPending}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Truck size={18} />
                  )}
                  Mark as Shipped
                </motion.button>
                <motion.button
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Modal */}
      <Dialog open={!!cancellingOrder} onOpenChange={(open) => !open && setCancellingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              Cancel Order
            </DialogTitle>
          </DialogHeader>
          
          {cancellingOrder && (
            <div className="space-y-6 py-4">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="font-medium text-lg text-foreground">{cancellingOrder.order_number}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {cancellingOrder.customer_name} • {formatINR(Number(cancellingOrder.total))}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  The customer will be notified via email about the cancellation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancellationForm.reason}
                  onChange={(e) => setCancellationForm({ ...cancellationForm, reason: e.target.value })}
                  placeholder="Enter the reason for cancellation..."
                  rows={3}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={cancellationForm.refund_amount}
                  onChange={(e) => setCancellationForm({ ...cancellationForm, refund_amount: Number(e.target.value) })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Refund Method
                </label>
                <select
                  value={cancellationForm.refund_method}
                  onChange={(e) => setCancellationForm({ ...cancellationForm, refund_method: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                >
                  <option value="Original Payment Method">Original Payment Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Store Credit">Store Credit</option>
                  <option value="UPI">UPI</option>
                  <option value="No Refund">No Refund</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <motion.button
                  onClick={handleCancelOrder}
                  disabled={!cancellationForm.reason || updateOrderStatus.isPending}
                  className="flex-1 py-3 bg-red-600 text-white font-medium text-sm flex items-center justify-center gap-2 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Cancel Order
                </motion.button>
                <motion.button
                  onClick={() => setCancellingOrder(null)}
                  className="px-6 py-3 border border-border text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order History Modal */}
      <Dialog open={!!viewingHistoryOrder} onOpenChange={(open) => !open && setViewingHistoryOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="text-gold" size={20} />
              Order Status History
            </DialogTitle>
          </DialogHeader>
          
          {viewingHistoryOrder && (
            <div className="py-4">
              <OrderStatusHistory 
                orderId={viewingHistoryOrder.id} 
                orderNumber={viewingHistoryOrder.order_number} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminDashboard;
