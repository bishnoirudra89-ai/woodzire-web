-- Create order status history table
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read status history (for order tracking)
CREATE POLICY "Anyone can view order status history"
  ON public.order_status_history
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert (for admin)
CREATE POLICY "Authenticated users can insert status history"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Create trigger function to auto-record status changes
CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if status actually changed or this is a new order
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Order created'
        ELSE 'Status updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on orders table
CREATE TRIGGER trigger_record_order_status_change
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.record_order_status_change();