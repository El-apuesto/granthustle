import { useState, useEffect } from 'react';
import { DollarSign, LogOut, Calendar, FileText, Bookmark, Users, Mail, TrendingUp, Settings, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import GrantMatches from './GrantMatches';
import SavedGrants from './SavedGrants';
import ApplicationWizard from './ApplicationWizard';
import FiscalSponsorMatcher from './FiscalSponsorMatcher';
import LOIGenerator from './LOIGenerator';
import WinRateTracker from './WinRateTracker';
import Questionnaire from './Questionnaire';
import AdminDashboard from './AdminDashboard';

type TabType = 'matches' | 'saved' | 'templates' | 'sponsors' | 'loi' | 'tracker' | 'settings' | 'admin';

interface Profile {
  subscription_tier: string;
  subscription_status: string;
  monthly_matches_used: number;
  questionnaire_completed: boolean;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, monthly_matches_used, questionnaire_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const isPro = profile?.subscription_tier !== 'free';
  const matchesRemaining = isPro ? 'Unlimited' : `${Math.max(0, 5 - (profile?.monthly_matches_used || 0))}/5`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold text-white">GrantHustle</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-slate-400">Matches: {matchesRemaining}</div>
                <div className="text-xs text-slate-500 capitalize">
                  {profile?.subscription_tier?.replace('_', ' ')} tier
                </div>
              </div>
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-2 px-4 py-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Find your money
          </h1>
          <p className="text-slate-400">
            {isPro ? 'All systems go. Apply to everything.' : 'Using free tier. Upgrade for unlimited matches.'}
          </p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 border-b border-slate-700 min-w-max">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              My Matches
            </button>
            {isPro && (
              <>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'saved'
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Saved
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'templates'
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab('sponsors')}
                  className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'sponsors'
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Sponsors
                </button>
                <button
                  onClick={() => setActiveTab('loi')}
                  className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'loi'
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  LOI
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'tracker'
                      ? 'text-emerald-500 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Win Rate
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === 'matches' && <GrantMatches isPro={isPro} profile={profile} />}
        {activeTab === 'saved' && <SavedGrants isPro={isPro} />}
        {activeTab === 'templates' && <ApplicationWizard isPro={isPro} />}
        {activeTab === 'sponsors' && <FiscalSponsorMatcher isPro={isPro} />}
        {activeTab === 'loi' && <LOIGenerator isPro={isPro} />}
        {activeTab === 'tracker' && <WinRateTracker isPro={isPro} />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Edit Your Profile</h2>
              <p className="text-slate-400">
                Update your answers to get better grant matches.
              </p>
            </div>
            <Questionnaire onComplete={() => setActiveTab('matches')} />
          </div>
        )}
      </div>
    </div>
  );
}
