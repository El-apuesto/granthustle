import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Bookmark, ExternalLink, ArrowUpDown, Lock } from 'lucide-react';
import { supabase from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getFingerprint } from '../utils/fingerprint';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_YOUR_PUBLISHABLE_KEY_HERE'); // ← replace

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

export default function GrantMatches({ isPro, profile }: GrantMatchesProps) {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'deadline' | 'award'>('deadline');
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  const [limitExceeded, setLimitExceeded] = useState(false);

  useEffect(() => {
    loadGrants();
    if (user && isPro) loadSavedGrants();
  }, []);

  const loadGrants = async () => {
    setLoading(true);
    try {
      if (!isPro && user) {
        const { data: count } = await supabase.rpc('increment_match_counter', { user_uuid: user.id });
        if (count > 5) {
          setLimitExceeded(true);
          const fp = await getFingerprint();
          await supabase.rpc('log_abuse_attempt', { user_uuid: user.id, fingerprint_id: fp, abuse_type_param: 'exceeded_free_limit' });
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedGrants = async () => {
    const { data } = await supabase.from('saved_grants').select('grant_id').eq('user_id', user.id);
    if (data) setSavedGrantIds(new Set(data.map(d => d.grant_id)));
  };

  if (loading) return <div className="text-center py-12 text-white">Loading grants...</div>;

  if (limitExceeded) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-10 max-w-md w-full text-center">
          <Lock className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-6">Monthly Limit Reached</h3>
          <p className="text-lg text-gray-300 mb-8">
            You've used all 5 free monthly searches.
          </p>
          <button
            onClick={async () => {
              const stripe = await stripePromise;
              await stripe?.redirectToCheckout({
                lineItems: [{ price: 'price_YOUR_999_TO_2799_PRICE_ID', quantity: 1 }],
                mode: 'subscription',
                successUrl: window.location.origin + '/success',
                cancelUrl: window.location.origin,
              });
            }}
            className="px-10 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl rounded-xl shadow-2xl transition"
          >
            Upgrade for $9.99 first month
            <br />
            <span className="text-lg">then $27.99/month (cancel anytime)</span>
          </button>
          <p className="text-gray-500 text-sm mt-8">
            Your limit resets on the 1st of next month
          </p>
        </div>
      </div>
    );
  }

  if (grants.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-12 text-center">
        <p className="text-xl text-gray-300">No grants match your profile yet. Check back soon!</p>
      </div>
    );
  }

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const formatDeadline = (d: string | null, rolling: boolean) => rolling ? 'Rolling' : d ? new Date(d).toLocaleDateString() : 'TBD';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Matches</h2>
          <p className="text-gray-400">{grants.length} found</p>
        </div>
        <button onClick={() => { setSortBy(sortBy === 'deadline' ? 'award' : 'deadline'); loadGrants(); }} className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
          <ArrowUpDown className="w-5 h-5" />
          Sort by {sortBy === 'deadline' ? 'Award' : 'Deadline'}
        </button>
      </div>

      <div className="grid gap-6">
        {grants.map(grant => (
          <div key={grant.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-600 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{grant.title}</h3>
                <p className="text-gray-400">{grant.funder_name} • {grant.funder_type}</p>
              </div>
              {isPro && (
                <button onClick={() => toggleSave(grant.id)}>
                  <Bookmark className={`w-6 h-6 ${savedGrantIds.has(grant.id) ? 'fill-emerald-500 text-emerald-500' : 'text-gray-500'}`} />
                </button>
              )}
            </div>
            <p className="text-gray-300 mb-4 line-clamp-3">{grant.description}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                {formatCurrency(grant.award_min)} – {formatCurrency(grant.award_max)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {formatDeadline(grant.deadline, grant.is_rolling)}
              </span>
            </div>
            <a href={grant.apply_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
              View Grant <ExternalLink className="w-4 h-4 inline ml-1" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
