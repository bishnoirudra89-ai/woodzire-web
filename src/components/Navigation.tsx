import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import WoodzireLogo from './WoodzireLogo';
import { useCart } from '@/contexts/CartContext';

const navLinks = [
  { name: 'Shop', path: '/shop' },
  { name: 'Lookbook', path: '/lookbook' },
  { name: 'About', path: '/about' },
  { name: 'Track', path: '/track' },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-charcoal/90 backdrop-blur-sm'} transition-all duration-500`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Left - Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                    location.pathname === link.path
                      ? isScrolled ? 'text-foreground' : 'text-white'
                      : isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      className={`absolute -bottom-1 left-0 right-0 h-px ${isScrolled ? 'bg-foreground' : 'bg-white'}`}
                      layoutId="navUnderline"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <div className={`rounded-lg px-2 py-1 ${isScrolled ? 'bg-white' : 'bg-white'}`}>
              <WoodzireLogo />
            </div>
          </Link>

          {/* Right - Icons */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Search - Hidden on small mobile */}
            <motion.button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`hidden sm:block p-2 transition-colors ${isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </motion.button>

            {/* Cart */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className={`p-2 transition-colors relative ${isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Shopping cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>

            {/* User */}
            <Link to="/dashboard">
              <motion.button
                className={`p-2 transition-colors ${isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="User account"
              >
                <User size={18} strokeWidth={1.5} />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`overflow-hidden border-t ${isScrolled ? 'border-border bg-background' : 'border-white/20 bg-charcoal/95'}`}
            >
              <div className="container mx-auto px-6 py-4">
                <div className="relative max-w-xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search for handcrafted pieces..."
                    className={`w-full bg-transparent border-0 border-b px-0 py-2 focus:outline-none transition-colors text-sm tracking-wide ${
                      isScrolled 
                        ? 'border-border text-foreground placeholder:text-muted-foreground focus:border-foreground' 
                        : 'border-white/30 text-white placeholder:text-white/50 focus:border-white'
                    }`}
                    autoFocus
                  />
                  <Search className={`absolute right-0 top-1/2 -translate-y-1/2 ${isScrolled ? 'text-muted-foreground' : 'text-white/50'}`} size={16} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-xl md:hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <WoodzireLogo />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-colors ${
                      location.pathname === link.path
                        ? 'bg-gold/10 text-gold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="p-4 border-t border-border mt-auto">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  My Account
                </Link>
                <Link
                  to="/gift-cards"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Gift Cards
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
