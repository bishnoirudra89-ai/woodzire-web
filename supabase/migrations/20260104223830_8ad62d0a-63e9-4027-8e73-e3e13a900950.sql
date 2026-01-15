-- Add delivery_charge column to products table
ALTER TABLE public.products
ADD COLUMN delivery_charge numeric DEFAULT 0;