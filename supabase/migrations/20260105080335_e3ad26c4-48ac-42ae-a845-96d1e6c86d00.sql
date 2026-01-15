-- Create a function to notify on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    payload := jsonb_build_object(
      'type', 'order_status_change',
      'order_id', NEW.id,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'order_number', NEW.order_number,
      'customer_email', NEW.customer_email
    );
    
    -- Log the status change
    RAISE NOTICE 'Order % status changed from % to %', NEW.order_number, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();