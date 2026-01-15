-- Gift Cards System
CREATE TABLE public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  initial_balance NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  purchaser_email TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Gift card redemption history
CREATE TABLE public.gift_card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B Testing for Email Campaigns
CREATE TABLE public.email_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  variant_a_subject TEXT NOT NULL,
  variant_b_subject TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed')),
  variant_a_sent INTEGER NOT NULL DEFAULT 0,
  variant_b_sent INTEGER NOT NULL DEFAULT 0,
  variant_a_opens INTEGER NOT NULL DEFAULT 0,
  variant_b_opens INTEGER NOT NULL DEFAULT 0,
  variant_a_clicks INTEGER NOT NULL DEFAULT 0,
  variant_b_clicks INTEGER NOT NULL DEFAULT 0,
  winner TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;

-- Gift card policies
CREATE POLICY "Anyone can view their gift cards by code"
ON public.gift_cards
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage gift cards"
ON public.gift_cards
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can purchase gift cards"
ON public.gift_cards
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Gift card transactions viewable by admins"
ON public.gift_card_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create redemption transactions"
ON public.gift_card_transactions
FOR INSERT
WITH CHECK (true);

-- A/B test policies (admin only)
CREATE POLICY "Admins can manage A/B tests"
ON public.email_ab_tests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_recipient ON public.gift_cards(recipient_email);
CREATE INDEX idx_gift_card_transactions_card ON public.gift_card_transactions(gift_card_id);
CREATE INDEX idx_email_ab_tests_status ON public.email_ab_tests(status);