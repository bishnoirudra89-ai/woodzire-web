import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useActiveTestimonials } from '@/hooks/useTestimonials';

// Fallback testimonials in case database is empty
const fallbackTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'California, USA',
    rating: 5,
    text: 'The craftsmanship is absolutely stunning. The memorial urn we received was a beautiful tribute to my father. The attention to detail and quality of the wood is exceptional.',
    product: 'Memorial Urn',
  },
  {
    id: '2',
    name: 'Michael Chen',
    location: 'New York, USA',
    rating: 5,
    text: 'Outstanding quality and customer service. The wooden decor pieces transformed our living room. Each piece tells a story of skilled artisanship.',
    product: 'Home Decor Set',
  },
  {
    id: '3',
    name: 'Emily Williams',
    location: 'Texas, USA',
    rating: 5,
    text: 'I ordered custom wooden boxes for my jewelry business. The quality exceeded my expectations. Fast shipping from India to USA and beautiful packaging.',
    product: 'Custom Jewelry Boxes',
  },
  {
    id: '4',
    name: 'Robert Martinez',
    location: 'Florida, USA',
    rating: 5,
    text: 'The wooden kitchen accessories are both functional and beautiful. You can feel the quality in every piece. Will definitely order again!',
    product: 'Kitchen Accessories',
  },
];

const Testimonials = () => {
  const { data: dbTestimonials = [] } = useActiveTestimonials();
  
  // Use database testimonials if available, otherwise use fallback
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8860B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-gold text-xs tracking-[0.4em] uppercase">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wider mt-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Trusted by customers worldwide for exceptional craftsmanship and quality
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.slice(0, 4).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background p-6 rounded-lg border border-border/50 hover:border-gold/30 transition-all duration-300 group relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 text-gold/20 w-8 h-8" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-4">
                "{testimonial.text}"
              </p>

              {/* Product Tag */}
              {testimonial.product && (
                <span className="inline-block text-xs text-gold bg-gold/10 px-2 py-1 rounded mb-4">
                  {testimonial.product}
                </span>
              )}

              {/* Author */}
              <div className="border-t border-border/50 pt-4">
                <p className="font-display text-sm text-foreground">{testimonial.name}</p>
                {testimonial.location && (
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="font-display text-3xl text-gold">10+</p>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-gold">5000+</p>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-gold">50+</p>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">Countries Served</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-gold">100%</p>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">Handcrafted</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
