-- Product bundles table
CREATE TABLE public.product_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bundle items junction table
CREATE TABLE public.bundle_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add sale and delivery fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS international_delivery_charge NUMERIC DEFAULT 0;

-- Add gift card enhancements
ALTER TABLE public.gift_cards
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Abandoned carts table
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT NOT NULL,
  cart_items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  reminder_sent_count INTEGER NOT NULL DEFAULT 0,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Product bundles policies
CREATE POLICY "Anyone can view active bundles" ON public.product_bundles
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage bundles" ON public.product_bundles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Bundle items policies
CREATE POLICY "Anyone can view bundle items" ON public.bundle_items
FOR SELECT USING (true);

CREATE POLICY "Admins can manage bundle items" ON public.bundle_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Abandoned carts policies
CREATE POLICY "Users can view own abandoned carts" ON public.abandoned_carts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage abandoned carts" ON public.abandoned_carts
FOR ALL USING (true);

-- Update trigger for bundles
CREATE TRIGGER update_product_bundles_updated_at
BEFORE UPDATE ON public.product_bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for abandoned carts
CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();