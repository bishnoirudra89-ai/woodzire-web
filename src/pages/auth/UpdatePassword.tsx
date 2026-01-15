import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a valid session (clicked the email link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({ title: "Error", description: "Invalid or expired link.", variant: "destructive" });
        navigate('/auth'); // Redirect back to login if no token
      }
    });
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Password updated successfully!" });
      navigate('/'); // Send to Dashboard/Home
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-serif font-bold text-center mb-6">Set New Password</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Input 
              type="password" 
              placeholder="Enter new password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;