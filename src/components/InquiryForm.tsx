import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional(),
  product: z.string().trim().max(200, 'Product name too long').optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

const InquiryForm = () => {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    product: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryFormData, string>>>({});
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof InquiryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof InquiryFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof InquiryFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-inquiry', {
        body: result.data,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Inquiry Sent!',
        description: 'We will get back to you within 24 hours.',
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', phone: '', product: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({
        title: 'Error',
        description: 'Failed to send inquiry. Please try again or contact us via WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-display text-2xl mb-2">Thank You!</h3>
        <p className="text-muted-foreground">Your inquiry has been sent successfully.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
            className={`bg-background border-border/50 focus:border-gold ${errors.name ? 'border-red-500' : ''}`}
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Your Email *"
            value={formData.email}
            onChange={handleChange}
            className={`bg-background border-border/50 focus:border-gold ${errors.email ? 'border-red-500' : ''}`}
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleChange}
            className="bg-background border-border/50 focus:border-gold"
          />
        </div>
        <div>
          <Input
            name="product"
            placeholder="Product Interest (Optional)"
            value={formData.product}
            onChange={handleChange}
            className="bg-background border-border/50 focus:border-gold"
          />
        </div>
      </div>

      <div>
        <Textarea
          name="message"
          placeholder="Your Message *"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`bg-background border-border/50 focus:border-gold resize-none ${errors.message ? 'border-red-500' : ''}`}
          required
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold-light text-primary-foreground font-display tracking-wider"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Inquiry
          </>
        )}
      </Button>
    </form>
  );
};

export default InquiryForm;
