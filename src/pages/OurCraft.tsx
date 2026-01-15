import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

const OurCraft = () => {
  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1600)',
          }}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Story</span>
            <h1 className="font-display text-5xl md:text-6xl tracking-wider mt-4">
              The Art of <span className="text-gold">Woodcraft</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Philosophy</span>
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mt-4 mb-6">
                Honoring Nature's Masterpiece
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At Woodzire, we believe that every piece of wood carries within it centuries of stories—
                  of sun and rain, of seasons passed, of the quiet patience of growth. Our mission is to 
                  reveal these stories through meticulous craftsmanship.
                </p>
                <p>
                  Founded by master woodworkers with over four decades of combined experience, 
                  Woodzire represents the pinnacle of artisanal excellence. Each piece that leaves 
                  our workshop has been touched by hands that understand the sacred relationship 
                  between craftsman and material.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="aspect-[4/5] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800"
                alt="Craftsman at work"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-gold text-xs tracking-[0.4em] uppercase">The Process</span>
            <h2 className="font-display text-3xl md:text-4xl tracking-wider mt-4">
              From Forest to Heirloom
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Selection',
                description: 'We source only the finest woods from sustainable forests, selecting each piece for its unique grain patterns and inherent beauty.',
              },
              {
                step: '02',
                title: 'Crafting',
                description: 'Our artisans employ both time-honored techniques and precision modern tools, ensuring each piece meets our exacting standards.',
              },
              {
                step: '03',
                title: 'Finishing',
                description: 'Multiple coats of hand-rubbed oil and wax bring out the natural luster, creating a finish that will only improve with age.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <span className="font-display text-5xl text-gold/30">{item.step}</span>
                <h3 className="font-display text-xl tracking-wider mt-4 mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 aspect-square overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                alt="Wood grain detail"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Values</span>
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mt-4 mb-8">
                Crafted with Purpose
              </h2>
              
              <div className="space-y-8">
                {[
                  {
                    title: 'Sustainability',
                    description: 'We partner only with certified sustainable forestries, ensuring that our craft contributes to preservation rather than depletion.',
                  },
                  {
                    title: 'Authenticity',
                    description: 'Every piece is made by hand, never mass-produced. Each item bears the subtle marks of human touch that distinguish true craftsmanship.',
                  },
                  {
                    title: 'Legacy',
                    description: 'We create pieces meant to be passed down through generations, becoming more beautiful and meaningful with time.',
                  },
                ].map((value) => (
                  <div key={value.title}>
                    <h3 className="font-display text-lg tracking-wider text-gold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default OurCraft;
