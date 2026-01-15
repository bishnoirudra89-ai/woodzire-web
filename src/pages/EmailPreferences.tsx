import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Package, Tag, Newspaper, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface EmailPreference {
  id?: string;
  order_updates: boolean;
  shipping_notifications: boolean;
  promotional_emails: boolean;
  back_in_stock_alerts: boolean;
  newsletter: boolean;
}

const EmailPreferences = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [preferences, setPreferences] = useState<EmailPreference>({
    order_updates: true,
    shipping_notifications: true,
    promotional_emails: false,
    back_in_stock_alerts: true,
    newsletter: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('email_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPreferences({
            id: data.id,
            order_updates: data.order_updates,
            shipping_notifications: data.shipping_notifications,
            promotional_emails: data.promotional_emails,
            back_in_stock_alerts: data.back_in_stock_alerts,
            newsletter: data.newsletter,
          });
        }
      } catch (err) {
        // No preferences yet, use defaults
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const handleToggle = (key: keyof EmailPreference) => {
    if (key === 'id') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const prefData = {
        user_id: user.id,
        user_email: user.email || '',
        order_updates: preferences.order_updates,
        shipping_notifications: preferences.shipping_notifications,
        promotional_emails: preferences.promotional_emails,
        back_in_stock_alerts: preferences.back_in_stock_alerts,
        newsletter: preferences.newsletter,
      };

      if (preferences.id) {
        const { error } = await supabase
          .from('email_preferences')
          .update(prefData)
          .eq('id', preferences.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_preferences')
          .insert(prefData);
        
        if (error) throw error;
      }

      toast({
        title: 'Preferences Saved',
        description: 'Your email preferences have been updated.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceOptions = [
    {
      key: 'order_updates' as const,
      icon: Package,
      title: 'Order Updates',
      description: 'Receive confirmation emails when you place an order',
    },
    {
      key: 'shipping_notifications' as const,
      icon: Mail,
      title: 'Shipping Notifications',
      description: 'Get notified when your order ships and with tracking updates',
    },
    {
      key: 'back_in_stock_alerts' as const,
      icon: Bell,
      title: 'Back in Stock Alerts',
      description: 'Be notified when products you requested are back in stock',
    },
    {
      key: 'promotional_emails' as const,
      icon: Tag,
      title: 'Promotional Emails',
      description: 'Receive exclusive offers, discounts, and sale announcements',
    },
    {
      key: 'newsletter' as const,
      icon: Newspaper,
      title: 'Newsletter',
      description: 'Monthly updates about new products, craftsmanship stories, and more',
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-warm pt-24">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Account</span>
            </Link>
            <h1 className="font-display text-xl text-foreground">Email Preferences</h1>
            <div className="w-24" />
          </div>
        </div>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-foreground mb-3">Notification Settings</h2>
            <p className="text-muted-foreground">Choose which emails you'd like to receive from Woodzire</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            {preferenceOptions.map((option, index) => (
              <motion.div
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 flex items-center justify-between gap-4 ${
                  index !== preferenceOptions.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <option.icon className="text-gold" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                    preferences[option.key] ? 'bg-gold' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{ left: preferences[option.key] ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {preferences[option.key] && <Check size={14} className="text-gold" />}
                  </motion.div>
                </button>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-8 py-4 bg-gold text-primary-foreground font-display tracking-widest uppercase rounded-xl shadow-gold flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Save Preferences'
            )}
          </motion.button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            You can update these preferences at any time. Transaction emails (like order receipts) will always be sent.
          </p>
        </motion.div>
      </div>

      <Footer />
    </main>
    </>
  );
};

export default EmailPreferences;
