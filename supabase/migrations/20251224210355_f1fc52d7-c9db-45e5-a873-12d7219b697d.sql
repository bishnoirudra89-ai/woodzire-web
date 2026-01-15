-- Fix 1: Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix 2: Explicitly block anonymous access to order_items
CREATE POLICY "Block anonymous access to order_items"
ON public.order_items
FOR SELECT
TO anon
USING (false);

-- Also ensure order_items INSERT is blocked for anon (they shouldn't create items directly)
CREATE POLICY "Block anonymous insert to order_items"
ON public.order_items
FOR INSERT
TO anon
WITH CHECK (false);