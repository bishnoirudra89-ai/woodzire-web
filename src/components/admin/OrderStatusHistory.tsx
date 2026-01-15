import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, History } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface StatusHistoryEntry {
  id: string;
  order_id: string;
  status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  } | null;
}

interface OrderStatusHistoryProps {
  orderId: string;
  orderNumber: string;
}

const OrderStatusHistory = ({ orderId, orderNumber }: OrderStatusHistoryProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['order-status-history-admin', orderId],
    queryFn: async () => {
      // First get the history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Get unique user IDs
      const userIds = [...new Set(historyData?.map(h => h.changed_by).filter(Boolean))];
      
      // Fetch profiles for those users
      let profiles: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds as string[]);
        
        profilesData?.forEach(p => {
          profiles[p.user_id] = p.full_name || 'Unknown User';
        });
      }

      // Merge profiles into history
      return historyData?.map(h => ({
        ...h,
        profile: h.changed_by ? { full_name: profiles[h.changed_by] || null } : null
      })) as StatusHistoryEntry[];
    },
    enabled: !!orderId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'preparing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="animate-spin" size={16} />
        <span className="text-sm">Loading history...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No status history available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <History size={16} className="text-gold" />
        Status History - {orderNumber}
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {history.map((entry, index) => (
          <div 
            key={entry.id} 
            className={`flex items-start gap-3 p-3 rounded-lg ${index === 0 ? 'bg-gold/5 border border-gold/20' : 'bg-muted/50'}`}
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-gold' : 'bg-muted-foreground/40'}`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
                {entry.notes && (
                  <span className="text-xs text-muted-foreground">• {entry.notes}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(entry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                
                {entry.profile?.full_name && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {entry.profile.full_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusHistory;
