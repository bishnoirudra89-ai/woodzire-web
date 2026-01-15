import GiftCardPurchase from '@/components/GiftCardPurchase';
import Footer from '@/components/Footer';

const GiftCards = () => {
  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-6 py-12">
        <GiftCardPurchase />
      </div>
      <Footer />
    </main>
  );
};

export default GiftCards;
