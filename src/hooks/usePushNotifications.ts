import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isLoading: boolean;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    isLoading: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setState(prev => ({ ...prev, isSupported }));
    return isSupported;
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  // Get existing subscription
  const getExistingSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in your browser.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push manager (using a placeholder VAPID key for demo)
      // In production, you'd use a real VAPID key from your server
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      // Save subscription to database
      if (user) {
        // Store subscription endpoint for the user (you'd create a table for this)
        console.log('Push subscription:', JSON.stringify(subscription));
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive order status updates.',
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Could not enable notifications. Please try again.',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, user, toast, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await state.subscription.unsubscribe();

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.subscription, toast]);

  // Send a local notification (for testing)
  const sendTestNotification = useCallback(async () => {
    if (!state.isSupported || Notification.permission !== 'granted') {
      toast({
        title: 'Cannot Send',
        description: 'Please enable notifications first.',
        variant: 'destructive',
      });
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Order Update', {
      body: 'Your order #WZ-240104-AB12 has been shipped!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'order-update',
      data: { url: '/track' },
    });
  }, [state.isSupported, toast]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const supported = checkSupport();
      if (!supported) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      await registerServiceWorker();
      const subscription = await getExistingSubscription();

      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
        isLoading: false,
      }));
    };

    init();
  }, [checkSupport, registerServiceWorker, getExistingSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
