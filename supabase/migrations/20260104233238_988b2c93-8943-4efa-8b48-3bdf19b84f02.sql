-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  product TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add estimated_delivery_days to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER DEFAULT 3;

-- Create triggers for updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories based on existing product categories
INSERT INTO public.categories (name, slug, description) VALUES 
  ('Handcrafted Urns', 'handcrafted-urns', 'Beautiful handcrafted memorial urns'),
  ('Nautical Decors', 'nautical-decors', 'Premium nautical decorative pieces'),
  ('Premium Yarn Winders', 'premium-yarn-winders', 'Quality yarn winders for crafters')
ON CONFLICT (name) DO NOTHING;

-- Insert default testimonials
INSERT INTO public.testimonials (name, location, rating, text, product) VALUES
  ('Sarah Johnson', 'California, USA', 5, 'The craftsmanship is absolutely stunning. The memorial urn we received was a beautiful tribute to my father. The attention to detail and quality of the wood is exceptional.', 'Memorial Urn'),
  ('Michael Chen', 'New York, USA', 5, 'Outstanding quality and customer service. The wooden decor pieces transformed our living room. Each piece tells a story of skilled artisanship.', 'Home Decor Set'),
  ('Emily Williams', 'Texas, USA', 5, 'I ordered custom wooden boxes for my jewelry business. The quality exceeded my expectations. Fast shipping from India to USA and beautiful packaging.', 'Custom Jewelry Boxes'),
  ('Robert Martinez', 'Florida, USA', 5, 'The wooden kitchen accessories are both functional and beautiful. You can feel the quality in every piece. Will definitely order again!', 'Kitchen Accessories');