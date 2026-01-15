import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Megaphone, Newspaper, TestTube, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type CampaignTemplate = 'promotional' | 'newsletter' | 'announcement';

interface CampaignForm {
  subject: string;
  template: CampaignTemplate;
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  testEmail: string;
}

const CampaignsTab = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  
  const [form, setForm] = useState<CampaignForm>({
    subject: '',
    template: 'promotional',
    headline: '',
    body: '',
    ctaText: 'Shop Now',
    ctaUrl: '',
    imageUrl: '',
    testEmail: '',
  });

  const templates = [
    { id: 'promotional' as const, name: 'Promotional', icon: Megaphone, description: 'Sales, offers, and discounts' },
    { id: 'newsletter' as const, name: 'Newsletter', icon: Newspaper, description: 'Monthly updates and stories' },
    { id: 'announcement' as const, name: 'Announcement', icon: Mail, description: 'Important news and updates' },
  ];

  const handleSend = async () => {
    if (!form.subject || !form.headline || !form.body) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (isTestMode && !form.testEmail) {
      toast({
        title: 'Test Email Required',
        description: 'Please enter a test email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: {
          subject: form.subject,
          template: form.template,
          content: {
            headline: form.headline,
            body: form.body,
            ctaText: form.ctaText || undefined,
            ctaUrl: form.ctaUrl || undefined,
            imageUrl: form.imageUrl || undefined,
          },
          testEmail: isTestMode ? form.testEmail : undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: isTestMode ? 'Test Email Sent' : 'Campaign Sent',
          description: isTestMode 
            ? `Test email sent to ${form.testEmail}`
            : `Campaign sent to ${data.sentCount} subscribers`,
        });
        
        if (!isTestMode) {
          setForm({
            subject: '',
            template: 'promotional',
            headline: '',
            body: '',
            ctaText: 'Shop Now',
            ctaUrl: '',
            imageUrl: '',
            testEmail: '',
          });
        }
      } else {
        toast({
          title: 'No Recipients',
          description: data?.message || 'No subscribers found for this campaign type.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send campaign.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg">Create Email Campaign</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send promotional emails and newsletters to your subscribers
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Campaign Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => setForm({ ...form, template: template.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.template === template.id
                      ? 'border-gold bg-gold/5'
                      : 'border-border hover:border-gold/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <template.icon 
                    size={20} 
                    className={form.template === template.id ? 'text-gold' : 'text-muted-foreground'} 
                  />
                  <p className="font-medium mt-2">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g., 🎉 Exclusive 20% Off - This Weekend Only!"
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Hero Image URL (optional)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-background border border-border pl-12 pr-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              {form.imageUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Headline *
            </label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g., Discover Our New Collection"
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email Body *
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write your email content here..."
              rows={6}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Button Text (optional)
              </label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="e.g., Shop Now"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Button Link (optional)
              </label>
              <input
                type="url"
                value={form.ctaUrl}
                onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                placeholder="https://woodzire.in/shop"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>

          {/* Send Options */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-sm">Send as test first</span>
              </label>
            </div>

            {isTestMode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={form.testEmail}
                  onChange={(e) => setForm({ ...form, testEmail: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
            )}

            <motion.button
              onClick={handleSend}
              disabled={isSending}
              className={`w-full py-4 font-medium text-sm flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-50 ${
                isTestMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gold text-primary-foreground hover:bg-gold-light shadow-gold'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isTestMode ? (
                <TestTube size={18} />
              ) : (
                <Send size={18} />
              )}
              {isSending 
                ? 'Sending...' 
                : isTestMode 
                  ? 'Send Test Email' 
                  : 'Send to All Subscribers'
              }
            </motion.button>

            {!isTestMode && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                This will send the campaign to all subscribers who opted in for {form.template} emails.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignsTab;
