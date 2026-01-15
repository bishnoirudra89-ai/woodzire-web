-- Add policy to prevent anonymous users from reading guest orders
-- Guest orders (user_id IS NULL) should only be accessible by admins

-- Ensure anon role cannot SELECT orders (they can only INSERT for guest checkout)
-- The existing policies already handle this correctly:
-- - "Users can view their own orders" requires auth.uid() = user_id (won't match NULL)
-- - "Admins can view all orders" is for admins only
-- Guest orders are already protected from anonymous SELECT

-- However, let's add an explicit policy to be extra clear
CREATE POLICY "Anon cannot view any orders"
ON public.orders
FOR SELECT
TO anon
USING (false);