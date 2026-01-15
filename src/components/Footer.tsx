import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import WoodzireLogo from './WoodzireLogo';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/shop' },
      { name: 'Lookbook', path: '/lookbook' },
      { name: 'Gift Cards', path: '/gift-cards' },
      { name: 'Track Order', path: '/track' },
    ],
    company: [
      { name: 'Our Craft', path: '/craft' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact Us', path: '/contact' },
    ],
    support: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Shipping Info', path: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/woodzire', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/woodzire', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/woodzire', label: 'Twitter' },
  ];

  return (
    <footer className="bg-charcoal text-white pb-20 md:pb-0">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl md:text-3xl mb-4">Join Our Community</h3>
              <p className="text-white/60 mb-8">
                Be the first to know about new collections, exclusive offers, and artisan stories.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 px-5 py-3 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
                />
                <motion.button
                  type="submit"
                  className="bg-gold text-charcoal px-6 py-3 rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                  <ArrowRight size={16} />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg p-2 inline-block">
              <WoodzireLogo />
            </div>
            <p className="mt-6 text-sm text-white/60 leading-relaxed max-w-sm">
              Handcrafted wooden artifacts made with passion, precision, and a reverence for nature's finest materials. Each piece tells a story of tradition and craftsmanship.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-gold hover:text-charcoal transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-sm tracking-widest uppercase mb-6 text-gold">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-sm tracking-widest uppercase mb-6 text-gold">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-display text-sm tracking-widest uppercase mt-8 mb-6 text-gold">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-sm tracking-widest uppercase mb-6 text-gold">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                <span className="text-sm text-white/60">
                  WOODZIRE LLC<br />
                  8 The Green Ste B<br />
                  Dover, DE 19901, USA
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                <span className="text-sm text-white/60">
                  Manufacturing Unit<br />
                  Bishnoi Sarai Nagina<br />
                  Bijnor 246762, UP, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold flex-shrink-0" />
                <a href="tel:+919528050221" className="text-sm text-white/60 hover:text-white transition-colors">
                  +91-9528050221
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold flex-shrink-0" />
                <a href="mailto:info@woodzire.llc" className="text-sm text-white/60 hover:text-white transition-colors">
                  info@woodzire.llc
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">
              © {currentYear} Woodzire LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-white/40">Crafted with passion in India</span>
              <div className="flex gap-4">
                <Link to="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-xs text-white/40 hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
