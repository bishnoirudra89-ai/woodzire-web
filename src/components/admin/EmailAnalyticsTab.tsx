import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Mail, MousePointer, Users, Send, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Campaign {
  id: string;
  subject: string;
  template: string;
  sent_count: number;
  total_recipients: number;
  created_at: string;
}

interface AnalyticsEvent {
  id: string;
  campaign_id: string;
  event_type: string;
  created_at: string;
}

const EmailAnalyticsTab = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  // Fetch analytics events
  const { data: analytics = [], isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['email-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_analytics')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AnalyticsEvent[];
    },
  });

  // Fetch subscriber count
  const { data: subscriberData } = useQuery({
    queryKey: ['email-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('id, created_at, promotional_emails, newsletter');
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
    const totalOpens = analytics.filter(a => a.event_type === 'opened').length;
    const totalClicks = analytics.filter(a => a.event_type === 'clicked').length;
    const totalBounces = analytics.filter(a => a.event_type === 'bounced').length;
    
    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0';
    const clickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : '0';
    const bounceRate = totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(1) : '0';
    
    const promoSubscribers = subscriberData?.filter(s => s.promotional_emails).length || 0;
    const newsletterSubscribers = subscriberData?.filter(s => s.newsletter).length || 0;

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalOpens,
      totalClicks,
      openRate,
      clickRate,
      bounceRate,
      promoSubscribers,
      newsletterSubscribers,
      totalSubscribers: subscriberData?.length || 0,
    };
  }, [campaigns, analytics, subscriberData]);

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const sent = campaigns.filter(c => 
        c.created_at.split('T')[0] === dateStr
      ).reduce((sum, c) => sum + c.sent_count, 0);
      
      const opens = analytics.filter(a => 
        a.event_type === 'opened' && a.created_at.split('T')[0] === dateStr
      ).length;
      
      const clicks = analytics.filter(a => 
        a.event_type === 'clicked' && a.created_at.split('T')[0] === dateStr
      ).length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sent,
        opens,
        clicks,
      });
    }
    
    return data;
  }, [campaigns, analytics, dateRange]);

  // Subscriber growth chart
  const subscriberGrowth = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = subscriberData?.filter(s => {
        const subDate = new Date(s.created_at);
        return subDate <= date;
      }).length || 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        subscribers: count,
      });
    }
    
    return data;
  }, [subscriberData, dateRange]);

  const isLoading = campaignsLoading || analyticsLoading;

  const handleRefresh = () => {
    refetchCampaigns();
    refetchAnalytics();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Email Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your email campaign performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  dateRange === range
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Send size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Total Sent</span>
          </div>
          <p className="font-display text-3xl">{stats.totalSent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalCampaigns} campaigns</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Mail size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Open Rate</span>
          </div>
          <p className="font-display text-3xl text-green-600">{stats.openRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalOpens.toLocaleString()} opens</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MousePointer size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Click Rate</span>
          </div>
          <p className="font-display text-3xl text-blue-600">{stats.clickRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalClicks.toLocaleString()} clicks</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Subscribers</span>
          </div>
          <p className="font-display text-3xl">{stats.totalSubscribers}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.promoSubscribers} promo, {stats.newsletterSubscribers} newsletter
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Email Performance Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-gold" />
            <h3 className="font-display text-lg">Email Performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sent" fill="hsl(var(--muted-foreground))" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opens" fill="hsl(142 70% 45%)" name="Opens" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="hsl(217 91% 60%)" name="Clicks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriber Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-gold" />
            <h3 className="font-display text-lg">Subscriber Growth</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriberGrowth}>
                <defs>
                  <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="hsl(var(--gold))" 
                  fillOpacity={1} 
                  fill="url(#colorSubscribers)" 
                  name="Subscribers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg">Recent Campaigns</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Mail size={32} className="mx-auto mb-3 opacity-50" />
            <p>No campaigns sent yet</p>
            <p className="text-sm mt-1">Start sending campaigns to see analytics here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.slice(0, 10).map((campaign) => {
              const campaignOpens = analytics.filter(a => 
                a.campaign_id === campaign.id && a.event_type === 'opened'
              ).length;
              const campaignClicks = analytics.filter(a => 
                a.campaign_id === campaign.id && a.event_type === 'clicked'
              ).length;
              const openRate = campaign.sent_count > 0 
                ? ((campaignOpens / campaign.sent_count) * 100).toFixed(1) 
                : '0';
              
              return (
                <div key={campaign.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{campaign.subject}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="capitalize">{campaign.template}</span>
                        <span>•</span>
                        <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-foreground">{campaign.sent_count}</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{openRate}%</p>
                        <p className="text-xs text-muted-foreground">Opens</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{campaignClicks}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailAnalyticsTab;
