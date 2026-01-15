import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
  { path: '/dashboard', icon: User, label: 'Account' },
];

const BottomNavigation = () => {
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground relative"
        >
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Cart</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
