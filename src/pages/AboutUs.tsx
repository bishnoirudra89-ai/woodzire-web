import { motion } from 'framer-motion';
import { Award, Globe, Factory, Users, Building2, MapPin, CheckCircle, Sparkles, Clock, Heart } from 'lucide-react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

const AboutUs = () => {
  const highlights = [
    { icon: Factory, title: 'State-of-the-art manufacturing facility in India' },
    { icon: Award, title: 'Advanced machinery for precision crafting' },
    { icon: Users, title: 'Skilled artisan team with generations of expertise' },
    { icon: CheckCircle, title: 'Strict quality control measures' },
  ];

  const globalPresence = [
    'International exports through established channels',
    'Quality certifications and compliance',
    'Decade-long industry experience',
  ];

  const heritageValues = [
    {
      icon: Clock,
      title: 'Time-Honored Techniques',
      description: 'Our craftsmen employ traditional woodworking methods passed down through generations, ensuring each piece carries the soul of authentic artisanship.',
    },
    {
      icon: Heart,
      title: 'Passion for Perfection',
      description: 'Every curve, joint, and finish is meticulously crafted with an unwavering commitment to excellence that defines true luxury.',
    },
    {
      icon: Sparkles,
      title: 'Sustainable Luxury',
      description: 'We source only the finest sustainable woods, ensuring our craft contributes to preservation rather than depletion of natural resources.',
    },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold/5 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold text-sm tracking-[0.4em] uppercase">Our Story</span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wider mt-4 mb-8">
                About <span className="text-gold">WOODZIRE</span>
              </h1>
              <p className="text-muted-foreground font-elegant text-xl leading-relaxed">
                With over a decade of expertise in crafting exquisite wooden handicrafts and home decor items, 
                WOODZIRE has established itself as a premier manufacturer in the industry.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Heritage Section */}
        <section className="py-24 bg-charcoal text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600')] bg-cover bg-center" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Heritage</span>
              <h2 className="font-display text-4xl md:text-5xl tracking-wider mt-4 mb-6">
                A Legacy of Craftsmanship
              </h2>
              <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
                Rooted in the rich woodworking traditions of India, our heritage spans generations of master craftsmen 
                who have dedicated their lives to perfecting the art of transforming raw timber into timeless treasures.
              </p>
            </motion.div>

            {/* Heritage Timeline Block */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center md:border-r border-white/10">
                  <span className="font-display text-5xl md:text-6xl text-gold">10+</span>
                  <p className="text-white/60 mt-2 uppercase tracking-wider text-sm">Years of Excellence</p>
                </div>
                <div className="text-center md:border-r border-white/10">
                  <span className="font-display text-5xl md:text-6xl text-gold">50+</span>
                  <p className="text-white/60 mt-2 uppercase tracking-wider text-sm">Master Artisans</p>
                </div>
                <div className="text-center">
                  <span className="font-display text-5xl md:text-6xl text-gold">25+</span>
                  <p className="text-white/60 mt-2 uppercase tracking-wider text-sm">Countries Served</p>
                </div>
              </div>
            </motion.div>

            {/* Heritage Values */}
            <div className="grid md:grid-cols-3 gap-8">
              {heritageValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-gold/30 transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-display text-xl tracking-wider mb-4">{value.title}</h3>
                  <p className="text-white/60 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 to-wood/20 blur-2xl rounded-3xl" />
                  <div className="relative card-3d bg-background rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                      alt="Woodzire Workshop"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Journey</span>
                <h2 className="font-display text-3xl md:text-4xl tracking-wider mt-4 mb-6">
                  A Decade of Excellence
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our journey began in India, where we've been successfully manufacturing and exporting 
                    through traditional channels for the past 10 years.
                  </p>
                  <p>
                    In February 2024, embracing the digital era, we expanded our global reach by incorporating 
                    WOODZIRE LLC in the United States (Company No. 3048061, DUNS No. 11-950-1602). This strategic 
                    move allows us to better serve our international clientele while maintaining our commitment 
                    to quality craftsmanship.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Manufacturing Excellence */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="text-gold text-xs tracking-[0.4em] uppercase">What Sets Us Apart</span>
              <h2 className="font-display text-4xl md:text-5xl tracking-wider mt-4">
                Manufacturing Excellence
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="card-3d group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="p-8 bg-card rounded-2xl border border-border/50 hover:border-gold/30 transition-all duration-500 h-full">
                    <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                      <item.icon className="w-8 h-8 text-gold" />
                    </div>
                    <p className="text-foreground font-medium">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Presence */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Globe className="w-12 h-12 text-gold mb-6" />
                <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-8">
                  Global Presence
                </h2>
                <ul className="space-y-4">
                  {globalPresence.map((item, index) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Company Information */}
              <div className="space-y-8">
                {/* US Entity */}
                <motion.div
                  className="card-3d"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="p-8 bg-background rounded-2xl border border-border/50">
                    <div className="flex items-center gap-4 mb-6">
                      <Building2 className="w-8 h-8 text-gold" />
                      <h3 className="font-display text-xl tracking-wider">US Entity</h3>
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      <p className="text-foreground font-semibold">WOODZIRE LLC</p>
                      <p>Company No. 3048061</p>
                      <p>DUNS No. 11-950-1602</p>
                      <p className="pt-2">8 The Green Ste B</p>
                      <p>Dover, Delaware 19901</p>
                      <p>USA</p>
                    </div>
                  </div>
                </motion.div>

                {/* Manufacturing Unit */}
                <motion.div
                  className="card-3d"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="p-8 bg-background rounded-2xl border border-border/50">
                    <div className="flex items-center gap-4 mb-6">
                      <MapPin className="w-8 h-8 text-gold" />
                      <h3 className="font-display text-xl tracking-wider">Manufacturing Unit</h3>
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      <p>Bishnoi Sarai Nagina</p>
                      <p>Bijnor 246762</p>
                      <p>UP, India</p>
                      <p className="pt-2 text-gold">handicraftglobal.in</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default AboutUs;
