-- Create table to track email campaign events
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  content JSONB NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table to track email analytics events
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  recipient_email TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email campaigns
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can view email analytics
CREATE POLICY "Admins can view email analytics"
ON public.email_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert analytics (for webhook from email provider)
CREATE POLICY "Service can insert analytics"
ON public.email_analytics
FOR INSERT
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_email_analytics_campaign ON public.email_analytics(campaign_id);
CREATE INDEX idx_email_analytics_event_type ON public.email_analytics(event_type);
CREATE INDEX idx_email_analytics_created_at ON public.email_analytics(created_at);
CREATE INDEX idx_email_campaigns_created_at ON public.email_campaigns(created_at);