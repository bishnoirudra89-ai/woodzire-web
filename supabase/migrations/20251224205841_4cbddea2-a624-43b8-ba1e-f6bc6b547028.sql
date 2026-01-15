-- Drop existing INSERT policy on orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create proper INSERT policies
-- Authenticated users can create orders for themselves
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow guest checkout (anon users can create orders with NULL user_id)
CREATE POLICY "Guests can create orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Note: The existing SELECT policies are correct:
-- - "Users can view their own orders" only matches when auth.uid() = user_id (non-NULL)
-- - "Admins can view all orders" covers guest orders (user_id IS NULL)
-- Guest orders (NULL user_id) are already protected - only admins can see them