import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if user has a valid session (came from reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: 'Invalid or expired link',
          description: 'Please request a new password reset link.',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    });
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validationResult = passwordSchema.safeParse(formData);
      
      if (!validationResult.success) {
        setError(validationResult.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast({ title: 'Password updated!', description: 'Your password has been successfully changed.' });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main 
      className="min-h-screen flex"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left Side - Image */}
      <div className="hidden lg:block w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200)',
          }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-display text-4xl tracking-wider mb-4">
              Welcome to <span className="text-gold">Woodzire</span>
            </h2>
            <p className="text-muted-foreground font-elegant text-lg italic">
              Where craftsmanship meets artistry
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to store</span>
          </Link>

          <h1 className="font-display text-3xl tracking-wider mb-2">
            {success ? 'Password Updated' : 'Set New Password'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {success 
              ? 'Your password has been successfully updated. You can now sign in with your new password.'
              : 'Enter your new password below.'
            }
          </p>

          {success ? (
            <div className="space-y-6">
              <div className="p-6 bg-gold/10 border border-gold/20 rounded flex items-center gap-4">
                <CheckCircle className="text-gold flex-shrink-0" size={24} />
                <p className="text-sm">
                  Your password has been changed successfully.
                </p>
              </div>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 bg-gold text-primary-foreground font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Dashboard
              </motion.button>
            </div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-3 text-destructive"
                >
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder-transparent peer focus:outline-none focus:border-gold transition-colors pr-10"
                    placeholder="New Password"
                    id="password"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold"
                  >
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder-transparent peer focus:outline-none focus:border-gold transition-colors"
                    placeholder="Confirm Password"
                    id="confirmPassword"
                    required
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-0 -top-3 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold"
                  >
                    Confirm Password
                  </label>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-gold text-primary-foreground font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : 'Update Password'}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </motion.main>
  );
};

export default UpdatePassword;
