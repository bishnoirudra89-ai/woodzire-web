import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Gift, Mail, Eye, EyeOff, Loader2, Send, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAllGiftCards, useCreateGiftCard, GiftCard } from '@/hooks/useGiftCards';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Hook to fetch users with profiles
const useUsers = () => {
  return useQuery({
    queryKey: ['users-with-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name');
      
      if (error) throw error;
      
      // Get unique emails from orders
      const { data: orderEmails } = await supabase
        .from('orders')
        .select('customer_email, customer_name')
        .order('created_at', { ascending: false });
      
      const uniqueEmails = new Map<string, string>();
      orderEmails?.forEach(o => {
        if (!uniqueEmails.has(o.customer_email)) {
          uniqueEmails.set(o.customer_email, o.customer_name);
        }
      });
      
      return Array.from(uniqueEmails.entries()).map(([email, name]) => ({
        email,
        name,
      }));
    },
  });
};

const GiftCardsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: giftCards = [], isLoading } = useAllGiftCards();
  const { data: users = [] } = useUsers();
  const createGiftCard = useCreateGiftCard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendEmailModal, setSendEmailModal] = useState<GiftCard | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [form, setForm] = useState({
    amount: 1000,
    purchaserEmail: 'admin@woodzire.com',
    recipientEmail: '',
    recipientName: '',
    message: '',
    is_public: false,
    usage_limit: null as number | null,
  });

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (form.amount < 100) {
      toast({ title: 'Invalid Amount', description: 'Minimum gift card value is ₹100', variant: 'destructive' });
      return;
    }

    await createGiftCard.mutateAsync({
      amount: form.amount,
      purchaserEmail: form.purchaserEmail,
      recipientEmail: form.recipientEmail || undefined,
      recipientName: form.recipientName || undefined,
      message: form.message || undefined,
    });

    // If it's a public gift card or has usage limit, update it
    if (form.is_public || form.usage_limit) {
      // Get the latest gift card
      const { data: latestCards } = await supabase
        .from('gift_cards')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestCards && latestCards[0]) {
        await supabase
          .from('gift_cards')
          .update({
            is_public: form.is_public,
            usage_limit: form.usage_limit,
          })
          .eq('id', latestCards[0].id);
      }
    }

    setIsModalOpen(false);
    setForm({
      amount: 1000,
      purchaserEmail: 'admin@woodzire.com',
      recipientEmail: '',
      recipientName: '',
      message: '',
      is_public: false,
      usage_limit: null,
    });
    queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift card?')) return;

    const { error } = await supabase.from('gift_cards').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Gift Card Deleted' });
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
    }
  };

  const handleToggleVisibility = async (card: GiftCard) => {
    const { error } = await supabase
      .from('gift_cards')
      .update({ is_public: !(card as any).is_public })
      .eq('id', card.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
    }
  };

  const handleSendEmail = async () => {
    if (!sendEmailModal || !recipientEmail) return;

    try {
      await supabase.functions.invoke('send-gift-card-email', {
        body: {
          recipientEmail,
          code: sendEmailModal.code,
          amount: sendEmailModal.initial_balance,
          message: sendEmailModal.message,
        },
      });
      toast({ title: 'Email Sent', description: `Gift card sent to ${recipientEmail}` });
      setSendEmailModal(null);
      setRecipientEmail('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const publicCards = giftCards.filter((c) => (c as any).is_public);
  const privateCards = giftCards.filter((c) => !(c as any).is_public);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={18} />
        Loading gift cards...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Gift Cards</h2>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gold text-primary-foreground flex items-center gap-2 text-sm font-medium rounded-xl hover:bg-gold-light transition-all shadow-gold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Create Gift Card
        </motion.button>
      </div>

      {/* Public Gift Cards */}
      {publicCards.length > 0 && (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <Eye className="text-gold" size={18} />
            Public Gift Cards (Shown at Checkout)
          </h3>
          <div className="grid gap-3">
            {publicCards.map((card) => (
              <GiftCardRow key={card.id} card={card} onDelete={handleDelete} onToggle={handleToggleVisibility} onSendEmail={setSendEmailModal} />
            ))}
          </div>
        </div>
      )}

      {/* All Gift Cards */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg mb-4">All Gift Cards ({giftCards.length})</h3>
        {giftCards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift size={48} className="mx-auto mb-4 opacity-50" />
            <p>No gift cards created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {giftCards.map((card) => (
              <GiftCardRow key={card.id} card={card} onDelete={handleDelete} onToggle={handleToggleVisibility} onSendEmail={setSendEmailModal} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Gift className="text-gold" size={20} />
              Create Gift Card
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Amount (₹) *</label>
              <input
                type="number"
                min="100"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((val) => (
                  <motion.button
                    key={val}
                    onClick={() => setForm({ ...form, amount: val })}
                    className={`px-3 py-1 text-sm rounded-lg ${form.amount === val ? 'bg-gold text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ₹{val}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Recipient Email (optional)</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => {
                    setForm({ ...form, recipientEmail: e.target.value });
                    setUserSearchQuery(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="Send directly to this email"
                />
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <Users size={18} />
                </button>
              </div>
              
              {/* User Dropdown */}
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, recipientEmail: user.email, recipientName: user.name });
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Recipient Name</label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="Recipient's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Message (optional)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                placeholder="Personal message..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                  className="w-4 h-4 accent-gold rounded"
                />
                <span className="text-sm">Public (show at checkout)</span>
              </label>
            </div>

            {form.is_public && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Usage Limit (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.usage_limit || ''}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            )}

            <motion.button
              onClick={handleCreate}
              disabled={createGiftCard.isPending || form.amount < 100}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {createGiftCard.isPending && <Loader2 className="animate-spin" size={18} />}
              Create Gift Card
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={!!sendEmailModal} onOpenChange={() => setSendEmailModal(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Mail className="text-gold" size={20} />
              Send Gift Card
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-mono text-lg">{sendEmailModal?.code}</p>
              <p className="text-gold font-display text-xl mt-1">{formatINR(sendEmailModal?.initial_balance || 0)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Recipient Email *</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                placeholder="recipient@email.com"
              />
            </div>

            <motion.button
              onClick={handleSendEmail}
              disabled={!recipientEmail}
              className="w-full py-3 bg-gold text-primary-foreground font-medium rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 shadow-gold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Send size={18} />
              Send Email
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const GiftCardRow = ({
  card,
  onDelete,
  onToggle,
  onSendEmail,
}: {
  card: GiftCard;
  onDelete: (id: string) => void;
  onToggle: (card: GiftCard) => void;
  onSendEmail: (card: GiftCard) => void;
}) => {
  const isPublic = (card as any).is_public;
  const usageLimit = (card as any).usage_limit;
  const usageCount = (card as any).usage_count || 0;

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <p className="font-mono font-medium">{card.code}</p>
          {isPublic && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">Public</span>}
          {!card.is_active && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Inactive</span>}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="text-gold font-medium">{formatINR(card.current_balance)} / {formatINR(card.initial_balance)}</span>
          {usageLimit && <span>Used: {usageCount}/{usageLimit}</span>}
          {card.recipient_email && <span>→ {card.recipient_email}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => onSendEmail(card)}
          className="p-2 text-muted-foreground hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Send by email"
        >
          <Mail size={18} />
        </motion.button>
        <motion.button
          onClick={() => onToggle(card)}
          className={`p-2 rounded-lg transition-colors ${isPublic ? 'text-gold hover:bg-gold/10' : 'text-muted-foreground hover:bg-muted'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPublic ? 'Make private' : 'Make public'}
        >
          {isPublic ? <Eye size={18} /> : <EyeOff size={18} />}
        </motion.button>
        <motion.button
          onClick={() => onDelete(card.id)}
          className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default GiftCardsTab;
