import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type AuthMode = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-success';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked password reset link - redirect to update password page
        navigate('/auth/update-password');
      } else if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        const validationResult = emailSchema.safeParse({ email: formData.email });
        
        if (!validationResult.success) {
          setError(validationResult.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
          setError(error.message);
        } else {
          setMode('reset-success');
        }
      } else if (mode === 'verify-otp') {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          email: formData.email,
          token: otpValue,
          type: 'signup',
        });

        if (error) {
          setError(error.message);
        } else {
          toast({ 
            title: 'Email Verified!', 
            description: 'Your account has been verified. Welcome to Woodzire!',
          });
          navigate('/dashboard');
        }
      } else {
        // Validate form data
        const validationResult = authSchema.safeParse({
          email: formData.email,
          password: formData.password,
          name: mode === 'register' ? formData.name : undefined,
        });

        if (!validationResult.success) {
          setError(validationResult.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        if (mode === 'login') {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) {
            if (error.message === 'Invalid login credentials') {
              setError('Invalid email or password. Please try again.');
            } else if (error.message.includes('Email not confirmed')) {
              // If email not confirmed, switch to OTP verification
              setMode('verify-otp');
              setResendCooldown(60);
              toast({ 
                title: 'Email Verification Required', 
                description: 'Please verify your email with the code we sent.',
              });
              // Resend OTP
              await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
              });
            } else {
              setError(error.message);
            }
          } else {
            toast({ title: 'Welcome back!', description: 'Successfully signed in.' });
          }
        } else if (mode === 'register') {
          const { error, data } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
              },
            },
          });

          if (error) {
            if (error.message.includes('already registered')) {
              setError('This email is already registered. Please sign in instead.');
            } else {
              setError(error.message);
            }
          } else if (data.user && !data.session) {
            // User created but needs email verification
            setMode('verify-otp');
            setResendCooldown(60);
            toast({ 
              title: 'Verification Code Sent!', 
              description: `We've sent a verification code to ${formData.email}`,
            });
          } else if (data.session) {
            // Auto-confirm is enabled
            toast({ 
              title: 'Account created!', 
              description: 'Welcome to Woodzire!',
            });
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) {
        setError(error.message);
      } else {
        setResendCooldown(60);
        toast({ 
          title: 'Code Resent', 
          description: 'A new verification code has been sent to your email.',
        });
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setOtpValue('');
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign In';
      case 'register': return 'Create Account';
      case 'verify-otp': return 'Verify Email';
      case 'forgot-password': return 'Reset Password';
      case 'reset-success': return 'Check Your Email';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Welcome back. Enter your credentials to access your account.';
      case 'register': return 'Join Woodzire to track orders and save favorites.';
      case 'verify-otp': return `Enter the 6-digit code we sent to ${formData.email}`;
      case 'forgot-password': return 'Enter your email and we\'ll send you a link to reset your password.';
      case 'reset-success': return `We've sent a password reset link to ${formData.email}. Check your inbox and click the link to reset your password.`;
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
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Back to home link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to store</span>
          </Link>

          <h1 className="font-display text-3xl tracking-wider mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-8">
            {getDescription()}
          </p>

          {mode === 'reset-success' ? (
            <div className="space-y-6">
              <div className="p-6 bg-gold/10 border border-gold/20 rounded flex items-center gap-4">
                <CheckCircle className="text-gold flex-shrink-0" size={24} />
                <p className="text-sm">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <motion.button
                onClick={() => switchMode('login')}
                className="w-full py-4 bg-gold text-primary-foreground font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Sign In
              </motion.button>
            </div>
          ) : mode === 'verify-otp' ? (
            <div className="space-y-6">
              <div className="p-6 bg-gold/10 border border-gold/20 rounded flex items-center gap-4">
                <Mail className="text-gold flex-shrink-0" size={24} />
                <p className="text-sm">
                  Check your inbox for the verification code. It may take a few minutes to arrive.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-3 text-destructive"
                >
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-gold text-primary-foreground font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </motion.button>
              </form>

              <div className="text-center space-y-4">
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-gold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : 'Resend verification code'}
                </button>
                <p className="text-muted-foreground text-sm">
                  Wrong email?
                  <button
                    onClick={() => switchMode('register')}
                    className="ml-2 text-gold hover:underline"
                  >
                    Go back
                  </button>
                </p>
              </div>
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
                {mode === 'register' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder-transparent peer focus:outline-none focus:border-gold transition-colors"
                      placeholder="Name"
                      id="name"
                      required={mode === 'register'}
                    />
                    <label
                      htmlFor="name"
                      className="absolute left-0 -top-3 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold"
                    >
                      Full Name
                    </label>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder-transparent peer focus:outline-none focus:border-gold transition-colors"
                    placeholder="Email"
                    id="email"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 -top-3 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold"
                  >
                    Email Address
                  </label>
                </div>

                {mode !== 'forgot-password' && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder-transparent peer focus:outline-none focus:border-gold transition-colors pr-10"
                      placeholder="Password"
                      id="password"
                      required
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-0 -top-3 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:text-gold"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-sm text-muted-foreground hover:text-gold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-gold text-primary-foreground font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : (
                    mode === 'login' ? 'Sign In' : 
                    mode === 'register' ? 'Create Account' : 
                    'Send Reset Link'
                  )}
                </motion.button>
              </form>

              <p className="text-center mt-8 text-muted-foreground">
                {mode === 'login' && (
                  <>
                    Don't have an account?
                    <button
                      onClick={() => switchMode('register')}
                      className="ml-2 text-gold hover:underline"
                    >
                      Create one
                    </button>
                  </>
                )}
                {mode === 'register' && (
                  <>
                    Already have an account?
                    <button
                      onClick={() => switchMode('login')}
                      className="ml-2 text-gold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === 'forgot-password' && (
                  <>
                    Remember your password?
                    <button
                      onClick={() => switchMode('login')}
                      className="ml-2 text-gold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </motion.div>
      </div>
    </motion.main>
  );
};

export default Auth;