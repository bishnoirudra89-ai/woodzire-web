import { useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, X, ChevronDown } from 'lucide-react';
import Footer from '@/components/Footer';
import { useActiveProducts } from '@/hooks/useProducts';
import heroImage from '@/assets/hero-wooden-crafts.jpg';

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'urns', name: 'Handcrafted Urns' },
  { id: 'nautical', name: 'Nautical Decors' },
  { id: 'yarn-winders', name: 'Premium Yarn Winders' },
];

const woodTypes = [
  'Sheesham',
  'Rosewood',
  'Teak',
  'Walnut',
  'Mango',
  'Black Walnut',
  'Cherry',
  'Oak',
];

const Lookbook = () => {
  const { data: products = [] } = useActiveProducts();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWoodType, setSelectedWoodType] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  
  // Get featured products for lookbook
  const featuredProducts = useMemo(() => {
    let filtered = products.filter(p => p.is_featured || p.is_trending);
    
    if (selectedCategory !== 'all') {
      const categorySlug = selectedCategory.toLowerCase();
      filtered = filtered.filter(p => 
        p.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === categorySlug
      );
    }
    
    if (selectedWoodType) {
      filtered = filtered.filter(p => p.wood_type === selectedWoodType);
    }
    
    return filtered.slice(0, 12);
  }, [products, selectedCategory, selectedWoodType]);

  const availableWoodTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => {
      if (p.wood_type) types.add(p.wood_type);
    });
    return Array.from(types);
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedWoodType('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedWoodType !== '';

  const LookbookSection = ({ 
    product, 
    index, 
    reverse = false 
  }: { 
    product: typeof products[0]; 
    index: number; 
    reverse?: boolean;
  }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: sectionRef,
      offset: ["start end", "end start"]
    });
    
    const y = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

    return (
      <motion.section
        ref={sectionRef}
        className={`relative py-24 lg:py-32 ${index % 2 === 0 ? 'bg-background' : 'bg-alabaster'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className={`container mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center`}>
          {/* Image */}
          <motion.div 
            className={`relative overflow-hidden aspect-[4/5] ${reverse ? 'lg:order-2' : ''}`}
            style={{ y }}
          >
            <img
              src={product.images?.[0] || 'https://placehold.co/800x1000?text=Woodzire'}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Editorial Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div 
            className={`py-8 lg:py-0 ${reverse ? 'lg:order-1 lg:text-right' : ''}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              {product.category}
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
              {product.name}
            </h2>
            <p className={`text-muted-foreground text-lg leading-relaxed max-w-md mb-8 font-light ${reverse ? 'lg:ml-auto' : ''}`}>
              {product.description || 'Handcrafted with precision and care, this piece embodies the essence of timeless woodcraft.'}
            </p>
            
            {product.wood_type && (
              <p className="text-sm text-muted-foreground mb-8">
                <span className="text-foreground font-medium">Material:</span> {product.wood_type}
              </p>
            )}
            
            <Link to={`/product/${product.id}`}>
              <motion.button
                className={`group inline-flex items-center gap-3 text-foreground text-sm tracking-[0.2em] uppercase border-b border-foreground pb-2 ${reverse ? 'lg:ml-auto' : ''}`}
                whileHover={{ x: 5 }}
              >
                View Details
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    );
  };

  return (
    <main ref={containerRef} className="bg-background">
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY, scale: heroScale }}
        >
          <motion.img
            src={heroImage}
            alt="Lookbook Hero"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        </motion.div>

        <motion.div
          className="relative z-10 text-center text-white px-6"
          style={{ opacity: heroOpacity }}
        >
          <motion.span
            className="inline-block text-xs tracking-[0.5em] uppercase text-white/70 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            The Collection
          </motion.span>
          <motion.h1 
            className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wide text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Lookbook
          </motion.h1>
          <motion.p 
            className="max-w-lg mx-auto mt-8 text-white/80 text-lg font-light tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            A curated journey through our finest handcrafted pieces
          </motion.p>
          
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <button
              onClick={() => setIsFilterOpen(true)}
              className="btn-pill-outline inline-flex items-center gap-2"
            >
              <Filter size={16} />
              Filter Collection
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity: heroOpacity }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </motion.div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Filter size={20} />
              </button>
              
              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent border-0 text-sm tracking-wide pr-8 cursor-pointer focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
                
                <div className="w-px h-4 bg-border" />
                
                <div className="relative">
                  <select
                    value={selectedWoodType}
                    onChange={(e) => setSelectedWoodType(e.target.value)}
                    className="appearance-none bg-transparent border-0 text-sm tracking-wide pr-8 cursor-pointer focus:outline-none"
                  >
                    <option value="">All Woods</option>
                    {availableWoodTypes.map(wood => (
                      <option key={wood} value={wood}>{wood}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
                
                {hasActiveFilters && (
                  <>
                    <div className="w-px h-4 bg-border" />
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gold hover:text-gold-dark transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {featuredProducts.length} {featuredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl">Filter Collection</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4 tracking-widest uppercase">Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-3 text-sm rounded-xl text-left transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-charcoal text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4 tracking-widest uppercase">Wood Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedWoodType('')}
                    className={`px-4 py-3 text-sm rounded-xl text-left transition-all ${
                      selectedWoodType === ''
                        ? 'bg-charcoal text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    All Woods
                  </button>
                  {availableWoodTypes.map(wood => (
                    <button
                      key={wood}
                      onClick={() => setSelectedWoodType(wood)}
                      className={`px-4 py-3 text-sm rounded-xl text-left transition-all ${
                        selectedWoodType === wood
                          ? 'bg-charcoal text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {wood}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-charcoal text-white rounded-xl text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Editorial Sections */}
      {featuredProducts.length > 0 ? (
        featuredProducts.map((product, index) => (
          <LookbookSection
            key={product.id}
            product={product}
            index={index}
            reverse={index % 2 === 1}
          />
        ))
      ) : (
        <section className="py-32 text-center">
          <div className="container mx-auto px-8">
            <p className="text-muted-foreground text-lg mb-6">No products match your filters</p>
            <button
              onClick={clearFilters}
              className="btn-pill"
            >
              Clear Filters
            </button>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-luxury bg-charcoal text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-8"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8">
            Discover More
          </h2>
          <p className="text-white/70 text-lg mb-12 max-w-lg mx-auto font-light">
            Explore our complete collection of handcrafted masterpieces
          </p>
          <Link to="/shop">
            <motion.button
              className="btn-pill-outline"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Shop Collection
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
};

export default Lookbook;
