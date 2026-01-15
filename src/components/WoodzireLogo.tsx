import { motion } from 'framer-motion';

interface WoodzireLogoProps {
  className?: string;
  iconOnly?: boolean;
}

const WoodzireLogo = ({ className = '' }: WoodzireLogoProps) => {
  return (
    <motion.div 
      className={`flex items-center group cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.img
        src="https://ucarecdn.com/0fef8564-5e0f-43e9-bfd0-5a55f5de2483/-/format/auto/"
        alt="Woodzire Logo"
        className="h-10 w-auto object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

export default WoodzireLogo;
