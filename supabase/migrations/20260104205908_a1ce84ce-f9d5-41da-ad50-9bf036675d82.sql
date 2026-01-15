-- ============================================
-- WOODZIRE DATABASE SCHEMA
-- ============================================

-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'shipped', 'delivered', 'cancelled');

-- ============================================
-- USER ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HAS_ROLE FUNCTION (Security Definer)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(10,2),
    description TEXT,
    category TEXT NOT NULL,
    wood_type TEXT,
    images TEXT[] DEFAULT '{}',
    dimensions JSONB,
    care_instructions TEXT,
    shipping_info TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    prep_time_days INTEGER DEFAULT 7,
    is_made_to_order BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    shipping_cost NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    tracking_number TEXT,
    carrier_name TEXT,
    est_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STOCK ALERTS TABLE
-- ============================================
CREATE TABLE public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, user_email)
);

ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADDRESSES TABLE
-- ============================================
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WISHLIST TABLE
-- ============================================
CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PROFILE AUTO-CREATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ORDER NUMBER GENERATION
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    date_part TEXT;
    random_part TEXT;
BEGIN
    date_part := to_char(NOW(), 'YYMMDD');
    random_part := upper(substring(md5(random()::text) from 1 for 4));
    NEW.order_number := 'WZ-' || date_part || '-' || random_part;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();

-- ============================================
-- RLS POLICIES - USER ROLES
-- ============================================
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - PRODUCTS
-- ============================================
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can view all products" ON public.products
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - ORDERS
-- ============================================
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- Public order lookup by order number (for tracking)
CREATE POLICY "Anyone can view order by number" ON public.orders
    FOR SELECT
    USING (true);

-- ============================================
-- RLS POLICIES - ORDER ITEMS
-- ============================================
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Users can create order items for own orders" ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage order items" ON public.order_items
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- Public order items lookup (for tracking)
CREATE POLICY "Anyone can view order items" ON public.order_items
    FOR SELECT
    USING (true);

-- ============================================
-- RLS POLICIES - STOCK ALERTS
-- ============================================
CREATE POLICY "Users can create stock alerts" ON public.stock_alerts
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own stock alerts" ON public.stock_alerts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage stock alerts" ON public.stock_alerts
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - ADDRESSES
-- ============================================
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - WISHLIST
-- ============================================
CREATE POLICY "Users can manage own wishlist" ON public.wishlist
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));