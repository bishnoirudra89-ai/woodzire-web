-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow anyone to view product images (public bucket)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Update existing products to use INR pricing and woodcraft products
DELETE FROM public.products;

INSERT INTO public.products (name, slug, price, compare_at_price, description, category, wood_type, images, stock_quantity, low_stock_threshold, is_active, is_featured, is_trending, care_instructions, shipping_info)
VALUES
  (
    'Handcrafted Sheesham Wood Box',
    'handcrafted-sheesham-wood-box',
    2499,
    2999,
    'A beautifully handcrafted jewelry box made from premium Sheesham wood with intricate brass inlay work. Perfect for storing precious jewelry and keepsakes.',
    'Jewelry Boxes',
    'Sheesham',
    ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'],
    25,
    5,
    true,
    true,
    false,
    'Dust regularly with a soft, dry cloth. Apply natural wood polish every 6 months.',
    'Free shipping on orders over ₹2000. Ships within 3-5 business days.'
  ),
  (
    'Rosewood Carved Elephant',
    'rosewood-carved-elephant',
    4599,
    5499,
    'An exquisite hand-carved elephant figurine made from solid Rosewood. Each piece is meticulously crafted by skilled artisans from Rajasthan.',
    'Figurines',
    'Rosewood',
    ARRAY['https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800'],
    15,
    3,
    true,
    true,
    true,
    'Keep away from direct sunlight. Clean with soft dry cloth only.',
    'Free shipping. Handcrafted to order, ships within 7-10 business days.'
  ),
  (
    'Teak Wood Serving Tray',
    'teak-wood-serving-tray',
    1899,
    null,
    'A premium handcrafted serving tray made from aged Teak wood with brass handles. Perfect for serving guests or as a decorative piece.',
    'Kitchen & Dining',
    'Teak',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    30,
    8,
    true,
    false,
    true,
    'Hand wash only. Dry immediately after washing. Oil with food-safe mineral oil monthly.',
    'Ships within 2-3 business days.'
  ),
  (
    'Walnut Wood Photo Frame Set',
    'walnut-wood-photo-frame-set',
    3299,
    3999,
    'A set of 3 handcrafted photo frames in different sizes, made from premium Walnut wood with a natural matte finish.',
    'Home Decor',
    'Walnut',
    ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'],
    20,
    5,
    true,
    true,
    false,
    'Dust with soft cloth. Keep away from humid environments.',
    'Free shipping. Ships within 3-5 business days.'
  ),
  (
    'Mango Wood Wall Clock',
    'mango-wood-wall-clock',
    2799,
    3299,
    'A stunning wall clock handcrafted from reclaimed Mango wood with hand-painted Warli art. Runs on a silent quartz mechanism.',
    'Home Decor',
    'Mango',
    ARRAY['https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800'],
    18,
    4,
    true,
    false,
    true,
    'Dust gently with soft cloth. Keep away from moisture.',
    'Ships within 5-7 business days.'
  ),
  (
    'Sandalwood Incense Holder',
    'sandalwood-incense-holder',
    899,
    1099,
    'A beautiful incense holder carved from aromatic Sandalwood. Features intricate floral patterns and a natural fragrance.',
    'Spiritual & Pooja',
    'Sandalwood',
    ARRAY['https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800'],
    50,
    10,
    true,
    false,
    false,
    'Store in a cool, dry place to preserve natural fragrance.',
    'Ships within 1-2 business days.'
  ),
  (
    'Bamboo Desktop Organizer',
    'bamboo-desktop-organizer',
    1599,
    1899,
    'A minimalist desktop organizer made from sustainable bamboo. Features compartments for stationery, phone stand, and business card holder.',
    'Office & Study',
    'Bamboo',
    ARRAY['https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800'],
    35,
    8,
    true,
    true,
    false,
    'Wipe clean with damp cloth. Avoid excessive moisture.',
    'Ships within 2-3 business days.'
  ),
  (
    'Neem Wood Mortar & Pestle',
    'neem-wood-mortar-pestle',
    1299,
    null,
    'Traditional mortar and pestle set handcrafted from antibacterial Neem wood. Perfect for grinding spices and making chutneys.',
    'Kitchen & Dining',
    'Neem',
    ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'],
    40,
    10,
    true,
    false,
    true,
    'Season with oil before first use. Hand wash and dry immediately.',
    'Ships within 2-3 business days.'
  ),
  (
    'Deodar Wood Temple (Mandir)',
    'deodar-wood-temple-mandir',
    8999,
    10999,
    'A beautifully handcrafted home temple made from sacred Deodar wood with gold leaf detailing. Features intricate jaali work and carved pillars.',
    'Spiritual & Pooja',
    'Deodar',
    ARRAY['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800'],
    8,
    2,
    true,
    true,
    true,
    'Dust regularly. Apply natural wood polish twice a year.',
    'Free shipping. Made to order, ships within 15-20 business days.'
  ),
  (
    'Pine Wood Bookshelf (Foldable)',
    'pine-wood-bookshelf-foldable',
    5499,
    6499,
    'A portable foldable bookshelf made from sturdy Pine wood with a natural finish. Perfect for small spaces and easy to assemble.',
    'Furniture',
    'Pine',
    ARRAY['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
    12,
    3,
    true,
    false,
    false,
    'Keep away from direct sunlight to prevent warping. Clean with dry cloth.',
    'Ships within 5-7 business days.'
  ),
  (
    'Acacia Wood Cutting Board',
    'acacia-wood-cutting-board',
    1799,
    2199,
    'A premium cutting board made from durable Acacia wood with juice groove and handle. Naturally antimicrobial and knife-friendly.',
    'Kitchen & Dining',
    'Acacia',
    ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
    45,
    10,
    true,
    true,
    false,
    'Hand wash with mild soap. Oil regularly with food-safe mineral oil.',
    'Ships within 2-3 business days.'
  ),
  (
    'Cedar Wood Keepsake Box',
    'cedar-wood-keepsake-box',
    3499,
    4199,
    'An aromatic keepsake box made from Cedar wood with velvet lining. Natural moth-repellent properties make it perfect for storing woolens and precious items.',
    'Jewelry Boxes',
    'Cedar',
    ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'],
    22,
    5,
    true,
    false,
    true,
    'Store in a cool, dry place. Cedar fragrance naturally replenishes over time.',
    'Ships within 3-5 business days.'
  );