import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCardWithQuickView from '@/components/ProductCardWithQuickView';
import Footer from '@/components/Footer';
import { useActiveProducts } from '@/hooks/useProducts';
import { useActiveCategories } from '@/hooks/useCategories';
import { Slider } from '@/components/ui/slider';

const woodTypes = [
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

const ShopCatalog = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { data: products = [], isLoading } = useActiveProducts();
  const { data: dbCategories = [] } = useActiveCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedWoodTypes, setSelectedWoodTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Match by category name or slug
      const matchesCategory = !selectedCategory || 
        product.category.toLowerCase() === selectedCategory.toLowerCase() ||
        product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase();
      const matchesWoodType = selectedWoodTypes.length === 0 || 
        (product.wood_type && selectedWoodTypes.includes(product.wood_type));
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesWoodType && matchesPrice && matchesSearch;
    });
  }, [products, selectedCategory, selectedWoodTypes, priceRange, searchQuery]);

  const toggleWoodType = (woodType: string) => {
    setSelectedWoodTypes(prev => 
      prev.includes(woodType) 
        ? prev.filter(w => w !== woodType)
        : [...prev, woodType]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedWoodTypes([]);
    setPriceRange([0, 15000]);
    setSearchQuery('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-display text-sm tracking-widest uppercase mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`block w-full text-left text-sm py-2 transition-colors ${
              !selectedCategory ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Products
          </button>
          {dbCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`block w-full text-left text-sm py-2 transition-colors ${
                selectedCategory === category.name ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-display text-sm tracking-widest uppercase mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={15000}
          step={100}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Wood Type */}
      <div>
        <h3 className="font-display text-sm tracking-widest uppercase mb-4">Wood Type</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {woodTypes.map(woodType => (
            <label
              key={woodType}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleWoodType(woodType)}
            >
              <div 
                className={`w-4 h-4 border transition-colors ${
                  selectedWoodTypes.includes(woodType) 
                    ? 'bg-gold border-gold' 
                    : 'border-border group-hover:border-gold'
                }`}
              />
              <span className={`text-sm transition-colors ${
                selectedWoodTypes.includes(woodType) 
                  ? 'text-foreground' 
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {woodType}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="text-sm text-muted-foreground hover:text-gold transition-colors underline"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <main className="pt-24 relative">
      {/* Header */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold text-xs tracking-[0.4em] uppercase font-medium">Our Collection</span>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight mt-4 text-foreground">
              Shop Catalog
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto mb-8 leading-relaxed">
              Explore our curated selection of handcrafted wooden masterpieces from India
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-xl border border-white/20 pl-12 pr-4 py-3.5 rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32 glass-card p-6">
                <FilterContent />
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
              <motion.button
                onClick={() => setIsMobileFilterOpen(true)}
                className="p-4 bg-zinc-900 text-white rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SlidersHorizontal size={24} />
              </motion.button>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsMobileFilterOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="absolute left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl border-r border-white/20 p-6 overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-display text-lg tracking-wide">Filters</h2>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <FilterContent />
                </motion.div>
              </motion.div>
            )}

            {/* Product Grid - Masonry Layout */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products match your filters</p>
                  <button
                    onClick={clearFilters}
                    className="btn-pill"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="bento-grid">
                  {filteredProducts.map((product, index) => (
                    <ProductCardWithQuickView 
                      key={product.id}
                      product={product} 
                      index={index}
                      featured={index % 4 === 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ShopCatalog;
