import categoryUrns from '@/assets/category-urns.jpg';
import categoryDecor from '@/assets/category-decor.jpg';
import categoryTools from '@/assets/category-tools.jpg';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  category: string;
  woodType: string;
  images: string[];
  dimensions: string;
  care: string;
  shipping: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
}

// Empty products - will be populated from Supabase database after admin adds them
export const products: Product[] = [];

// Updated categories with wooden handicraft images
export const categories = [
  {
    id: 'urns',
    name: 'Handcrafted Urns',
    description: 'Beautifully handcrafted memorial urns made with care and respect',
    image: categoryUrns,
    slug: 'urns'
  },
  {
    id: 'decor',
    name: 'Nautical Decors',
    description: 'Elegant nautical-themed wooden pieces for your space',
    image: categoryDecor,
    slug: 'decor'
  },
  {
    id: 'tools',
    name: 'Premium Yarn Winders',
    description: 'High-quality yarn winders for crafters and artisans',
    image: categoryTools,
    slug: 'tools'
  }
];

export const woodTypes = [
  'Sheesham',
  'Rosewood',
  'Teak',
  'Walnut',
  'Mango',
  'Sandalwood',
  'Bamboo',
  'Neem',
  'Deodar',
  'Pine',
  'Acacia',
  'Cedar',
];
