import { motion } from 'framer-motion';
import { Bell, BellOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    permission,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle size={20} className="text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Push Notifications Not Supported</p>
          <p className="text-xs text-muted-foreground">
            Your browser doesn't support push notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Bell size={20} className="text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <BellOff size={20} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">Order Notifications</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? 'You will receive order status updates'
                  : 'Get notified when your order status changes'}
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              isSubscribed
                ? 'bg-muted text-foreground hover:bg-muted/80'
                : 'bg-gold text-primary-foreground hover:bg-gold-light'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSubscribed ? (
              'Disable'
            ) : (
              'Enable'
            )}
          </motion.button>
        </div>

        {permission === 'denied' && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}
      </div>

      {isSubscribed && (
        <motion.button
          onClick={sendTestNotification}
          className="w-full py-3 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Bell size={16} />
          Send Test Notification
        </motion.button>
      )}
    </div>
  );
};

export default NotificationSettings;
