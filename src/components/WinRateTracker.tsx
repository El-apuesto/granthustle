import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, Clock, CreditCard as Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  id: string;
  project_title: string;
  requested_amount: string;
  status: 'draft' | 'submitted' | 'awarded' | 'rejected';
  submitted_at: string | null;
  created_at: string;
}

interface WinRateTrackerProps {
  isPro: boolean;
}

export default function WinRateTracker({ isPro }: WinRateTrackerProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  const loadSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, project_title, requested_amount, status, submitted_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Submission['status']) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'submitted' && !submissions.find(s => s.id === id)?.submitted_at) {
      updates.submitted_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('submissions')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setSubmissions(prev =>
        prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub)
      );
      setEditingId(null);
    }
  };

  const calculateStats = () => {
    const submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'awarded' || s.status === 'rejected');
    const awarded = submissions.filter(s => s.status === 'awarded');
    const rejected = submissions.filter(s => s.status === 'rejected');
    const pending = submissions.filter(s => s.status === 'submitted');

    const winRate = submitted.length > 0 ? Math.round((awarded.length / submitted.length) * 100) : 0;
    const totalRequested = awarded.reduce((sum, sub) => {
      const amount = parseFloat(sub.requested_amount.replace(/[$,]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return { submitted: submitted.length, awarded: awarded.length, rejected: rejected.length, pending: pending.length, winRate, totalRequested };
  };

  const stats = calculateStats();

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Win-Rate Tracker is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to track your applications and monitor your success rate.
        </p>
        <button className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors">
          Upgrade for $9/month
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-slate-400">Loading submissions...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Win-Rate Tracker</h2>
        <p className="text-slate-400">
          Track your grant applications and monitor your success rate.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Submitted</div>
          <div className="text-3xl font-bold text-white">{stats.submitted}</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
          <div className="text-emerald-400 text-sm mb-1">Awarded</div>
          <div className="text-3xl font-bold text-emerald-400">{stats.awarded}</div>
        </div>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="text-red-400 text-sm mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="text-blue-400 text-sm mb-1">Pending</div>
          <div className="text-3xl font-bold text-blue-400">{stats.pending}</div>
        </div>
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <div className="text-purple-400 text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-purple-400">{stats.winRate}%</div>
        </div>
      </div>

      {stats.totalRequested > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 border border-emerald-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-emerald-300 text-sm">Total Awarded</div>
              <div className="text-3xl font-bold text-white">
                ${stats.totalRequested.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-300 text-lg mb-2">No submissions yet</p>
          <p className="text-slate-400">
            Create an application template to start tracking your submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div
              key={sub.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {sub.project_title || 'Untitled Project'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      Requested: {sub.requested_amount || 'N/A'}
                    </span>
                    <span className="text-slate-500">
                      Created: {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                    {sub.submitted_at && (
                      <span className="text-slate-500">
                        Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {editingId === sub.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(sub.id, 'draft')}
                      className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600"
                    >
                      Draft
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'submitted')}
                      className="px-3 py-1 bg-blue-700 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Submitted
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'awarded')}
                      className="px-3 py-1 bg-emerald-700 text-white rounded text-sm hover:bg-emerald-600"
                    >
                      Awarded
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'rejected')}
                      className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-600"
                    >
                      Rejected
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-slate-600 text-slate-300 rounded text-sm hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                      sub.status === 'awarded' ? 'bg-emerald-900/30 text-emerald-300' :
                      sub.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                      sub.status === 'submitted' ? 'bg-blue-900/30 text-blue-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {sub.status === 'awarded' && <CheckCircle className="w-4 h-4" />}
                      {sub.status === 'rejected' && <XCircle className="w-4 h-4" />}
                      {sub.status === 'submitted' && <Clock className="w-4 h-4" />}
                      <span className="capitalize">{sub.status}</span>
                    </div>
                    <button
                      onClick={() => setEditingId(sub.id)}
                      className="p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
