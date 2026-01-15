import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Play, Pause, Trophy, Send, Loader2, BarChart3, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ABTest {
  id: string;
  name: string;
  template: string;
  variant_a_subject: string;
  variant_b_subject: string;
  content: Record<string, unknown>;
  status: 'draft' | 'running' | 'completed';
  variant_a_sent: number;
  variant_b_sent: number;
  variant_a_opens: number;
  variant_b_opens: number;
  variant_a_clicks: number;
  variant_b_clicks: number;
  winner: string | null;
  created_at: string;
}

const ABTestingTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    template: 'promotional',
    variantASubject: '',
    variantBSubject: '',
    headline: '',
    body: '',
    ctaText: 'Shop Now',
    ctaUrl: '',
  });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ABTest[];
    },
  });

  const createTest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('email_ab_tests').insert({
        name: form.name,
        template: form.template,
        variant_a_subject: form.variantASubject,
        variant_b_subject: form.variantBSubject,
        content: {
          headline: form.headline,
          body: form.body,
          ctaText: form.ctaText || undefined,
          ctaUrl: form.ctaUrl || undefined,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'A/B Test Created', description: 'Your test is ready to run.' });
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      setIsCreating(false);
      setForm({
        name: '',
        template: 'promotional',
        variantASubject: '',
        variantBSubject: '',
        headline: '',
        body: '',
        ctaText: 'Shop Now',
        ctaUrl: '',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const startTest = useMutation({
    mutationFn: async (testId: string) => {
      // In production, this would send emails to subscribers
      // For now, we'll just update the status
      const { error } = await supabase
        .from('email_ab_tests')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', testId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Test Started', description: 'Emails are being sent to subscribers.' });
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

  const completeTest = useMutation({
    mutationFn: async (testId: string) => {
      const test = tests.find(t => t.id === testId);
      if (!test) return;
      
      const aRate = test.variant_a_sent > 0 ? test.variant_a_opens / test.variant_a_sent : 0;
      const bRate = test.variant_b_sent > 0 ? test.variant_b_opens / test.variant_b_sent : 0;
      const winner = aRate > bRate ? 'A' : bRate > aRate ? 'B' : 'tie';
      
      const { error } = await supabase
        .from('email_ab_tests')
        .update({ status: 'completed', completed_at: new Date().toISOString(), winner })
        .eq('id', testId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Test Completed', description: 'Results are now available.' });
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

  const getOpenRate = (sent: number, opens: number) => {
    return sent > 0 ? ((opens / sent) * 100).toFixed(1) : '0';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">A/B Testing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Test different subject lines to optimize open rates
          </p>
        </div>
        {!isCreating && (
          <motion.button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-gold text-primary-foreground text-sm font-medium rounded-xl flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FlaskConical size={16} />
            New A/B Test
          </motion.button>
        )}
      </div>

      {/* Create Test Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-6"
        >
          <h3 className="font-display text-lg">Create A/B Test</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Test Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Holiday Sale Subject Test"
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Template</label>
              <select
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              >
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">A</span>
                <span className="text-sm font-medium text-blue-800">Variant A Subject</span>
              </div>
              <input
                type="text"
                value={form.variantASubject}
                onChange={(e) => setForm({ ...form, variantASubject: e.target.value })}
                placeholder="Subject line version A"
                className="w-full bg-white border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">B</span>
                <span className="text-sm font-medium text-purple-800">Variant B Subject</span>
              </div>
              <input
                type="text"
                value={form.variantBSubject}
                onChange={(e) => setForm({ ...form, variantBSubject: e.target.value })}
                placeholder="Subject line version B"
                className="w-full bg-white border border-purple-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email Content (same for both)</label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="Headline"
              className="w-full bg-background border border-border px-4 py-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Email body..."
              rows={4}
              className="w-full bg-background border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold resize-none"
            />
          </div>

          <div className="flex gap-4">
            <motion.button
              onClick={() => createTest.mutate()}
              disabled={!form.name || !form.variantASubject || !form.variantBSubject || createTest.isPending}
              className="flex-1 py-3 bg-gold text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {createTest.isPending ? <Loader2 size={18} className="animate-spin" /> : <FlaskConical size={18} />}
              Create Test
            </motion.button>
            <motion.button
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 border border-border rounded-xl font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tests List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg">Your A/B Tests</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Loading...
          </div>
        ) : tests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FlaskConical size={32} className="mx-auto mb-3 opacity-50" />
            <p>No A/B tests yet</p>
            <p className="text-sm mt-1">Create your first test to optimize email performance</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tests.map((test) => (
              <div key={test.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{test.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        test.status === 'running' 
                          ? 'bg-green-100 text-green-700' 
                          : test.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {test.status}
                      </span>
                      {test.winner && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full">
                          <Trophy size={12} />
                          {test.winner === 'tie' ? 'Tie' : `Variant ${test.winner} wins`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(test.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {test.status === 'draft' && (
                    <motion.button
                      onClick={() => startTest.mutate(test.id)}
                      disabled={startTest.isPending}
                      className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play size={14} />
                      Start Test
                    </motion.button>
                  )}
                  
                  {test.status === 'running' && (
                    <motion.button
                      onClick={() => completeTest.mutate(test.id)}
                      disabled={completeTest.isPending}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause size={14} />
                      End Test
                    </motion.button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`rounded-xl p-4 ${test.winner === 'A' ? 'bg-green-50 border-2 border-green-300' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">A</span>
                      {test.winner === 'A' && <Trophy size={14} className="text-green-600" />}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-3 line-clamp-1">{test.variant_a_subject}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Send size={12} className="text-muted-foreground" />
                        <span>{test.variant_a_sent} sent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 size={12} className="text-green-600" />
                        <span className="text-green-600 font-medium">{getOpenRate(test.variant_a_sent, test.variant_a_opens)}% opens</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 ${test.winner === 'B' ? 'bg-green-50 border-2 border-green-300' : 'bg-purple-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">B</span>
                      {test.winner === 'B' && <Trophy size={14} className="text-green-600" />}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-3 line-clamp-1">{test.variant_b_subject}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Send size={12} className="text-muted-foreground" />
                        <span>{test.variant_b_sent} sent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 size={12} className="text-green-600" />
                        <span className="text-green-600 font-medium">{getOpenRate(test.variant_b_sent, test.variant_b_opens)}% opens</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ABTestingTab;
