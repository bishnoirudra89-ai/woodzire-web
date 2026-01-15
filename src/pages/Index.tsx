import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import ProductCardWithQuickView from '@/components/ProductCardWithQuickView';
import Testimonials from '@/components/Testimonials';
import RecentlyViewed from '@/components/RecentlyViewed';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { ArrowRight, BookOpen, Palette, Shield } from 'lucide-react';

const Index = () => {
  const { data: products = [] } = useProducts();
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 6);
  const trendingProducts = products.filter(p => p.is_trending).slice(0, 4);

  const features = [
    {
      icon: Palette,
      title: 'Artisan Crafted',
      description: 'Each piece is meticulously handcrafted by master artisans with decades of experience.',
    },
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'We source only the finest woods and materials for lasting beauty.',
    },
    {
      icon: BookOpen,
      title: 'Heritage Design',
      description: 'Our designs blend traditional craftsmanship with contemporary aesthetics.',
    },
  ];

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Strip */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <feature.icon className="mx-auto mb-4 text-gold" size={28} strokeWidth={1.5} />
                <h3 className="font-display text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection - Bento Grid */}
      <section className="section-luxury">
        <div className="container mx-auto px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              The Collection
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4">
              Featured Pieces
            </h2>
          </motion.div>

          <div className="bento-grid">
            {featuredProducts.map((product, index) => (
              <ProductCardWithQuickView 
                key={product.id} 
                product={product} 
                index={index}
                featured={index === 0 || index === 3}
              />
            ))}
          </div>

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/shop">
              <motion.button
                className="btn-pill"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Pieces
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Lookbook Promo */}
      <section className="py-24 bg-alabaster overflow-hidden">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-gold">
                Editorial
              </span>
              <h2 className="font-display text-4xl md:text-5xl mt-4 mb-6">
                The Lookbook
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-light">
                Explore our collection through the lens of editorial photography. 
                See how each piece transforms spaces and tells a story of craftsmanship.
              </p>
              <Link to="/lookbook">
                <motion.button
                  className="group inline-flex items-center gap-3 text-foreground text-sm tracking-[0.2em] uppercase border-b border-foreground pb-2"
                  whileHover={{ x: 5 }}
                >
                  View Lookbook
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {trendingProducts.slice(0, 2).map((product, index) => (
                  <motion.div
                    key={product.id}
                    className={`relative overflow-hidden ${index === 0 ? 'aspect-[3/4]' : 'aspect-square mt-8'}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x500?text=Woodzire'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section-luxury bg-charcoal text-white relative overflow-hidden">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-white/50">
                Our Heritage
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-8">
                Crafted with<br />Passion
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6 tracking-wide font-light">
                Since 2014, our master artisans have been transforming premium woods into 
                timeless pieces that tell stories of craftsmanship and dedication.
              </p>
              <p className="text-white/70 text-lg leading-relaxed tracking-wide font-light">
                Each creation is a testament to the harmony between traditional techniques 
                and contemporary design sensibilities.
              </p>
            </motion.div>

            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img 
                src={trendingProducts[0]?.images?.[0] || 'https://placehold.co/600x750?text=Craftsmanship'}
                alt="Woodzire Craftsmanship"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      {trendingProducts.length > 0 && (
        <section className="section-luxury">
          <div className="container mx-auto px-8">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                Trending Now
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4">
                Most Loved
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingProducts.map((product, index) => (
                <ProductCardWithQuickView 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="section-luxury bg-alabaster">
        <div className="container mx-auto px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8">
              Begin Your Collection
            </h2>
            <p className="text-muted-foreground text-lg tracking-wide mb-12 font-light">
              Discover pieces that will become the centerpiece of your space
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <motion.button
                  className="btn-pill"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Collection
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  className="px-8 py-4 bg-transparent border-b border-foreground text-foreground font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get in Touch
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Index;
