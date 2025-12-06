import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Trash2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SavedGrant {
  id: string;
  grant_id: string;
  status: string;
  notes: string | null;
  saved_at: string;
  grants: {
    title: string;
    funder_name: string;
    funder_type: string;
    award_min: number;
    award_max: number;
    deadline: string | null;
    is_rolling: boolean;
    apply_url: string;
  };
}

interface SavedGrantsProps {
  isPro: boolean;
}

export default function SavedGrants({ isPro }: SavedGrantsProps) {
  const { user } = useAuth();
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedGrants();
  }, [user]);

  const loadSavedGrants = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_grants')
        .select(`
          id,
          grant_id,
          status,
          notes,
          saved_at,
          grants (
            title,
            funder_name,
            funder_type,
            award_min,
            award_max,
            deadline,
            is_rolling,
            apply_url
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedGrants(data || []);
    } catch (error) {
      console.error('Failed to load saved grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id: string) => {
    const { error } = await supabase
      .from('saved_grants')
      .delete()
      .eq('id', id);

    if (!error) {
      setSavedGrants(prev => prev.filter(sg => sg.id !== id));
    }
  };

  const exportToCalendar = () => {
    const events = savedGrants
      .filter(sg => sg.grants.deadline && !sg.grants.is_rolling)
      .map(sg => {
        const deadline = new Date(sg.grants.deadline!);
        const title = `Grant Deadline: ${sg.grants.title}`;
        const description = `Funder: ${sg.grants.funder_name}\\nAward: $${sg.grants.award_min}-$${sg.grants.award_max}\\nApply: ${sg.grants.apply_url}`;

        return `BEGIN:VEVENT
DTSTART:${deadline.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT`;
      }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GrantHustle//Grant Deadlines//EN
${events}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-deadlines.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (deadline: string | null, isRolling: boolean) => {
    if (isRolling) return 'Rolling';
    if (!deadline) return 'TBD';
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Saved Grants is a Pro feature
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to save grants, set reminders, and export to your calendar.
        </p>
        <button className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors">
          Upgrade for $9/month
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-slate-400">Loading saved grants...</div>;
  }

  if (savedGrants.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <p className="text-slate-300 text-lg mb-2">No saved grants yet</p>
        <p className="text-slate-400">
          Go to My Matches and click the bookmark icon to save grants.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Saved grants</h2>
          <p className="text-slate-400 text-sm">{savedGrants.length} grants saved</p>
        </div>
        <button
          onClick={exportToCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Calendar
        </button>
      </div>

      <div className="space-y-4">
        {savedGrants.map(saved => (
          <div
            key={saved.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {saved.grants.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="font-medium">{saved.grants.funder_name}</span>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                    {saved.grants.funder_type}
                  </span>
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded text-xs capitalize">
                    {saved.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeSaved(saved.id)}
                className="p-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>
                  {formatCurrency(saved.grants.award_min)} - {formatCurrency(saved.grants.award_max)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{formatDeadline(saved.grants.deadline, saved.grants.is_rolling)}</span>
              </div>
            </div>

            {saved.notes && (
              <div className="bg-slate-700 rounded p-3 mb-4">
                <p className="text-slate-300 text-sm">{saved.notes}</p>
              </div>
            )}

            <a
              href={saved.grants.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded font-semibold hover:bg-slate-600 transition-colors"
            >
              View Application
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
