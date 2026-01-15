import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import CompareDrawer from "@/components/CompareDrawer";
import ChatWidget from "@/components/ChatWidget";
import Preloader from "@/components/Preloader";
import PageWrapper from "@/components/PageWrapper";
import PromotionalBanner from "@/components/PromotionalBanner";
import BottomNavigation from "@/components/BottomNavigation";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const ShopCatalog = lazy(() => import("./pages/ShopCatalog"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const OurCraft = lazy(() => import("./pages/OurCraft"));
const Contact = lazy(() => import("./pages/Contact"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderTracker = lazy(() => import("./pages/OrderTracker"));
const EmailPreferences = lazy(() => import("./pages/EmailPreferences"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const Payment = lazy(() => import("./pages/Payment"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Page loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
          <Route path="/shop" element={<PageWrapper><ShopCatalog /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductPage /></PageWrapper>} />
          <Route path="/lookbook" element={<PageWrapper><Lookbook /></PageWrapper>} />
          <Route path="/craft" element={<PageWrapper><OurCraft /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><AboutUs /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
          <Route path="/terms" element={<PageWrapper><TermsConditions /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/auth/update-password" element={<PageWrapper><UpdatePassword /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
          <Route path="/track" element={<PageWrapper><OrderTracker /></PageWrapper>} />
          <Route path="/email-preferences" element={<PageWrapper><EmailPreferences /></PageWrapper>} />
          <Route path="/gift-cards" element={<PageWrapper><GiftCards /></PageWrapper>} />
          <Route path="/payment" element={<PageWrapper><Payment /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

// Wrapper to conditionally show Navigation
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/auth');
  const isTrackerRoute = location.pathname.startsWith('/track');

  return (
    <>
      {/* Promotional Banner */}
      {!isAdminRoute && !isAuthRoute && !isTrackerRoute && <PromotionalBanner />}

      {/* Background Gradient Blob */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      </div>

      {!isAdminRoute && !isAuthRoute && !isTrackerRoute && <Navigation />}
      {!isAdminRoute && !isAuthRoute && !isTrackerRoute && <CartDrawer />}
      {!isAdminRoute && !isAuthRoute && !isTrackerRoute && <CompareDrawer />}
      {!isAdminRoute && !isAuthRoute && <ChatWidget />}
      
      <AnimatedRoutes />
      
      {/* Mobile Bottom Navigation */}
      {!isAdminRoute && !isAuthRoute && !isTrackerRoute && <BottomNavigation />}
    </>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <Toaster />
              <Sonner />
              {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
