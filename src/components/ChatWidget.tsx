import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mail, Phone, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'contact'>('chat');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert({
        name,
        email,
        message,
      });

      if (error) throw error;

      toast({
        title: 'Message Sent!',
        description: 'We\'ll get back to you soon.',
      });

      setMessage('');
      setName('');
      setEmail('');
      setIsOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Chat Button - positioned above bottom nav on mobile */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 bg-gold text-charcoal p-4 rounded-full shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-charcoal text-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Chat with Us</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 text-xs tracking-wider uppercase rounded-lg transition-colors ${
                    activeTab === 'chat' ? 'bg-gold text-charcoal' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Send Message
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 py-2 text-xs tracking-wider uppercase rounded-lg transition-colors ${
                    activeTab === 'contact' ? 'bg-gold text-charcoal' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Contact Info
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {activeTab === 'chat' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full bg-muted border-0 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      required
                      className="w-full bg-muted border-0 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      rows={4}
                      required
                      className="w-full bg-muted border-0 px-4 py-3 rounded-xl text-sm resize-none focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gold text-charcoal font-medium text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-6">
                    Prefer to reach us directly? Here's how:
                  </p>
                  
                  <a
                    href="mailto:info@woodzire.llc"
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <Mail size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Us</p>
                      <p className="text-xs text-muted-foreground">info@woodzire.llc</p>
                    </div>
                  </a>
                  
                  <a
                    href="tel:+919528050221"
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <Phone size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Call Us</p>
                      <p className="text-xs text-muted-foreground">+91-9528050221</p>
                    </div>
                  </a>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Available Mon-Sat, 9AM - 6PM IST
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
