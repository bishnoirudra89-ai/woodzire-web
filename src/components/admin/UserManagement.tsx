import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  created_at: string;
}

const fetchUsersWithRoles = async (): Promise<UserWithRole[]> => {
  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, created_at');

  if (profilesError) throw profilesError;

  // Fetch user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Create a map of user_id to role
  const roleMap = new Map(userRoles?.map(ur => [ur.user_id, ur.role]) || []);

  // Get emails from email_preferences table (if available)
  const { data: emailPrefs, error: emailPrefsError } = await supabase
    .from('email_preferences')
    .select('user_id, user_email');

  // Create a map of user_id to email from email_preferences
  const emailMap = new Map(emailPrefs?.map(ep => [ep.user_id, ep.user_email]) || []);

  // Also try to get emails from orders table (customer_email matches user emails)
  // Group by customer_email and try to match with user_ids
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, customer_email')
    .not('user_id', 'is', null);

  // Add order emails to the map
  orders?.forEach(order => {
    if (order.user_id && order.customer_email && !emailMap.has(order.user_id)) {
      emailMap.set(order.user_id, order.customer_email);
    }
  });

  // Build users array
  const users: UserWithRole[] = (profiles || []).map(profile => ({
    id: profile.id,
    user_id: profile.user_id,
    full_name: profile.full_name,
    email: emailMap.get(profile.user_id) || '',
    role: roleMap.get(profile.user_id) || 'user',
    created_at: profile.created_at,
  }));

  return users;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [sendingReset, setSendingReset] = useState<string | null>(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsersWithRoles,
  });

  const handleSendResetEmail = async (userEmail: string, userId: string) => {
    if (!userEmail) {
      toast({
        title: 'Error',
        description: 'User email not available. Please use Supabase Admin API or create a database view.',
        variant: 'destructive',
      });
      return;
    }

    setSendingReset(userId);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Email Sent',
          description: `Password reset email sent to ${userEmail}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setSendingReset(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading users...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users and send password reset emails
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || 'Email not available'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-gold/10 text-gold'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <motion.button
                        onClick={() => handleSendResetEmail(user.email, user.user_id)}
                        disabled={!user.email || sendingReset === user.user_id}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        whileHover={{ scale: sendingReset === user.user_id ? 1 : 1.02 }}
                        whileTap={{ scale: sendingReset === user.user_id ? 1 : 0.98 }}
                      >
                        {sendingReset === user.user_id ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail size={14} />
                            Send Reset Email
                          </>
                        )}
                      </motion.button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {users.length > 0 && users.every(u => !u.email) && (
          <div className="p-4 bg-amber-50 border-t border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> User emails are not available. To enable email functionality, 
              create a database view or RPC function that joins profiles with auth.users table, 
              or use Supabase Admin API from a backend service.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserManagement;
