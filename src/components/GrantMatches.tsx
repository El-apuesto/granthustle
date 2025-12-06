import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Bookmark, ExternalLink, ArrowUpDown, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getFingerprint } from '../utils/fingerprint';
import { loadStripe } from '@stripe/stripe-js';

interface Grant {
  id: string;
  title: string;
  funder_name: string;
  funder_type: string;
  description: string;
  award_min: number;
  award_max: number;
  deadline: string | null;
  is_rolling: boolean;
  apply_url: string;
}

interface GrantMatchesProps {
  isPro: boolean;
  profile: any;
}

const stripePromise = loadStripe('pk_live_YOUR_PUBLISHABLE_KEY_HERE'); // ← replace with your real key

export default function GrantMatches({ isPro, profile }: GrantMatchesProps) {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'deadline' | 'award'>('deadline');
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  const [limitExceeded, setLimitExceeded] = useState(false);

  useEffect(() => {
    loadGrants();
    loadSavedGrants();
  }, []);

  const loadGrants = async () => {
    setLoading(true);
    try {
      if (!isPro && user) {
        const { data: countData } = await supabase.rpc('increment_match_counter', { user_uuid: user.id });
        if (countData > 5) {
          setLimitExceeded(true);
          const fingerprint = await getFingerprint();
          await supabase.rpc('log_abuse_attempt', {
            user_uuid: user.id,
            fingerprint_id: fingerprint,
            abuse_type_param: 'exceeded_free_limit',
            details_param: { match_count: countData, limit: 5 }
          });
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('is_active', true)
        .order(sortBy === 'deadline' ? 'deadline' : 'award_max', { ascending: sortBy === 'deadline' })
        .limit(isPro ? 10000 : 50);

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Failed to load grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedGrants = async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_grants').select('grant_id').eq('user_id', user.id);
    if (data) setSavedGrantIds(new Set(data.map(sg => sg.grant_id)));
  };

  const toggleSave = async (grantId: string) => {
    if (!user || !isPro) return;
    const isSaved = savedGrantIds.has(grantId);
    // ... (save logic unchanged)
  };

  if (loading) return <div className="text-slate-400">Loading grants...</div>;

  if (limitExceeded) {
    return (
      <div className="fixed inset-0
