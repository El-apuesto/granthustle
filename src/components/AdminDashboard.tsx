import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SyncLog {
  id: string;
  source: string;
  sync_started_at: string;
  sync_completed_at: string | null;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  status: 'running' | 'completed' | 'failed';
  error_message: string | null;
}

interface GrantStats {
  total: number;
  by_source: { source: string; count: number }[];
  active: number;
  expired: number;
}

const SYNC_FUNCTIONS = [
  { id: 'sync-grants-gov', name: 'Grants.gov / SAM.gov', description: 'Federal grant opportunities' },
  { id: 'sync-usaspending', name: 'USASpending.gov', description: 'Historical federal awards data' },
  { id: 'sync-state-portals', name: 'State Grant Portals', description: 'All state grant systems' },
];

export default function AdminDashboard() {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [grantStats, setGrantStats] = useState<GrantStats | null>(null);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyncLogs();
    loadGrantStats();
    const interval = setInterval(() => {
      loadSyncLogs();
      loadGrantStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_sync_log')
        .select('*')
        .order('sync_started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Failed to load sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrantStats = async () => {
    try {
      const { count: total } = await supabase
        .from('grants')
        .select('*', { count: 'exact', head: true });

      const { count: active } = await supabase
        .from('grants')
        .select('*', { count: 'exact', head: true })
        .eq('sync_status', 'active');

      const { data: bySource } = await supabase
        .from('grants')
        .select('source')
        .order('source');

      const sourceCounts = (bySource || []).reduce((acc, { source }) => {
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setGrantStats({
        total: total || 0,
        active: active || 0,
        expired: (total || 0) - (active || 0),
        by_source: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })),
      });
    } catch (error) {
      console.error('Failed to load grant stats:', error);
    }
  };

  const triggerSync = async (functionName: string) => {
    setSyncing(prev => new Set(prev).add(functionName));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`Sync completed!\nProcessed: ${result.processed || result.total_processed || 0}\nCreated: ${result.created || result.total_created || 0}\nUpdated: ${result.updated || result.total_updated || 0}`);
      } else {
        alert(`Sync failed: ${result.error}`);
      }

      loadSyncLogs();
      loadGrantStats();
    } catch (error) {
      console.error('Sync error:', error);
      alert(`Sync error: ${error}`);
    } finally {
      setSyncing(prev => {
        const next = new Set(prev);
        next.delete(functionName);
        return next;
      });
    }
  };

  const triggerAllSyncs = async () => {
    for (const func of SYNC_FUNCTIONS) {
      await triggerSync(func.id);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Grant Sync Admin</h1>
        <button
          onClick={triggerAllSyncs}
          disabled={syncing.size > 0}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${syncing.size > 0 ? 'animate-spin' : ''}`} />
          Sync All Sources
        </button>
      </div>

      {grantStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-semibold text-white">Total Grants</h3>
            </div>
            <p className="text-4xl font-bold text-white">{grantStats.total.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Active</h3>
            </div>
            <p className="text-4xl font-bold text-white">{grantStats.active.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-slate-500" />
              <h3 className="text-lg font-semibold text-white">Expired</h3>
            </div>
            <p className="text-4xl font-bold text-white">{grantStats.expired.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Sync Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYNC_FUNCTIONS.map(func => (
            <div key={func.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-1">{func.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{func.description}</p>
              <button
                onClick={() => triggerSync(func.id)}
                disabled={syncing.has(func.id)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing.has(func.id) ? 'animate-spin' : ''}`} />
                {syncing.has(func.id) ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {grantStats && grantStats.by_source.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Grants by Source</h2>
          <div className="space-y-3">
            {grantStats.by_source.map(({ source, count }) => (
              <div key={source} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                <span className="text-slate-300 font-medium capitalize">{source.replace(/_/g, ' ')}</span>
                <span className="text-white font-bold">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Sync History</h2>
        <div className="space-y-3">
          {syncLogs.map(log => (
            <div key={log.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {log.source.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {new Date(log.sync_started_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {log.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {log.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  {log.status === 'running' && <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />}
                  <span className={`text-sm font-semibold ${
                    log.status === 'completed' ? 'text-green-500' :
                    log.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-400">Processed</p>
                  <p className="text-lg font-bold text-white">{log.records_processed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-lg font-bold text-green-500">{log.records_created}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Updated</p>
                  <p className="text-lg font-bold text-blue-500">{log.records_updated}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Failed</p>
                  <p className="text-lg font-bold text-red-500">{log.records_failed}</p>
                </div>
              </div>
              {log.error_message && (
                <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
                  {log.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
