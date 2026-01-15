import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle, Send, Building2, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send via edge function (emails + saves to DB)
      const { error } = await supabase.functions.invoke('send-inquiry', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Building2,
      title: 'US Office',
      lines: [
        '8 The Green Ste B',
        'Dover, Delaware 19901',
        'USA'
      ]
    },
    {
      icon: Factory,
      title: 'Manufacturing Unit',
      lines: [
        'Bishnoi Sarai Nagina',
        'Bijnor 246762',
        'UP, India'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      lines: [
        'ashwin@woodzire.in',
        'info@woodzire.llc'
      ],
      isLink: true
    },
    {
      icon: Phone,
      title: 'Phone',
      lines: [
        '+91-9528050221'
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <motion.div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-gold/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-wood/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold text-sm tracking-[0.4em] uppercase">Reach Out</span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wider mt-4 mb-6">
              Get in <span className="text-gold-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground font-elegant text-xl">
              We'd love to hear from you. Let's create something beautiful together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="card-3d group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-full p-6 bg-background rounded-2xl border border-border/50 hover:border-gold/30 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <card.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display text-lg mb-3">{card.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {card.lines.map((line, idx) => (
                      <p key={idx} className={card.isLink ? 'hover:text-gold cursor-pointer transition-colors' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-6">
          <motion.a
            href="https://wa.me/919528050221"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-4 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl mx-auto max-w-md transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-display tracking-wider">Chat on WhatsApp</span>
          </motion.a>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Contact Form</span>
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mt-4">
                Send Us a Message
              </h2>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Name *</label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-card border-border/50 focus:border-gold h-12"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Email *</label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card border-border/50 focus:border-gold h-12"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone (Optional)</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-card border-border/50 focus:border-gold h-12"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Message *</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-card border-border/50 focus:border-gold min-h-[150px] resize-none"
                  placeholder="Tell us about your project or inquiry..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gold hover:bg-gold-light text-primary-foreground font-display tracking-widest uppercase"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contact;
