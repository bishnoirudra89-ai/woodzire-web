import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { toast } = useToast();

  const addToCompare = (product: Product) => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast({
        title: 'Compare limit reached',
        description: `You can only compare up to ${MAX_COMPARE_ITEMS} products`,
        variant: 'destructive',
      });
      return;
    }

    if (compareItems.find(p => p.id === product.id)) {
      toast({
        title: 'Already in compare',
        description: 'This product is already in your comparison list',
      });
      return;
    }

    setCompareItems(prev => [...prev, product]);
    toast({
      title: 'Added to compare',
      description: `${product.name} added to comparison`,
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
