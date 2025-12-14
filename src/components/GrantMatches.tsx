// GrantMatches.tsx - FINAL FIXED VERSION
// Ready to drop into src/components

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Bookmark, ExternalLink, ArrowUpDown, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getFingerprint } from '../utils/fingerprint';

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
const [matchCount, setMatchCount] = useState(0);

useEffect(() => {
loadGrants();
loadSavedGrants();
}, []);

// Stripe checkout handler - redirects to Stripe checkout
const handleUpgrade = async () => {
try {
const res = await fetch("/api/create-checkout-session", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
priceId: "price_1Sa918G85r4wkmwW786cBMaH", // Standard tier $27.99
userId: user?.id || null,
}),
});

if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
const data = await res.json();

if (data?.url) {
window.location.href = data.url;
} else {
alert("Unable to start subscription checkout. Try again.");
}
} catch (err) {
alert("An unexpected error occurred. Please try again.");
}
};

const loadGrants = async () => {
setLoading(true);
try {
// For free users, check usage limit
if (!isPro && user) {
const { data: countData, error: countError } = await supabase
.rpc('increment_match_counter', { user_uuid: user.id });

if (countError) {
console.error('Failed to increment counter:', countError);
} else {
setMatchCount(countData || 0);

// If limit exceeded, block access
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
}

// Load grants
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
const { data } = await supabase
.from('saved_grants')
.select('grant_id')
.eq('user_id', user.id);

if (data) {
setSavedGrantIds(new Set(data.map(sg => sg.grant_id)));
}
};

const toggleSave = async (grantId: string) => {
if (!user || !isPro) return;

const isSaved = savedGrantIds.has(grantId);

if (isSaved) {
const { error } = await supabase
.from('saved_grants')
.delete()
.eq('user_id', user.id)
.eq('grant_id', grantId);

if (!error) {
setSavedGrantIds(prev => {
const next = new Set(prev);
next.delete(grantId);
return next;
});
}
} else {
const { error } = await supabase
.from('saved_grants')
.insert({
user_id: user.id,
grant_id: grantId,
});

if (!error) {
setSavedGrantIds(prev => new Set(prev).add(grantId));
}
}
};

// Helpers
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

// Conditional rendering
if (loading) {
return <div className="text-slate-400">Loading grants...</div>;
}

if (limitExceeded) {
return (
<div className="bg-slate-800 border border-red-700 rounded-lg p-12 text-center">
<Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
<h3 className="text-2xl font-bold text-white mb-3">Monthly Limit Reached</h3>
<p className="text-slate-300 text-lg mb-2">
You've used all 5 of your free monthly searches.
</p>
<p className="text-slate-400 mb-6">
Upgrade to unlock unlimited grant matches and access all premium features.
</p>
<button
onClick={handleUpgrade}
className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-lg"
>
Upgrade for $27.99/month
</button>
<p className="text-slate-500 text-sm mt-4">
Your limit resets on the 1st of next month
</p>
</div>
);
}

if (grants.length === 0) {
return (
<div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
<p className="text-slate-300 text-lg mb-4">No grants available yet</p>
<p className="text-slate-400">Check back soon or contact us to add grants to your area.</p>
</div>
);
}

// Main render
return (
<div>
{/* HEADER */}
<div className="mb-6 flex justify-between items-center">
<div>
<h2 className="text-xl font-semibold text-white mb-1">Your matches</h2>
<p className="text-slate-400 text-sm">
{isPro ? `${grants.length.toLocaleString()} grants available` : `Showing 5 of ${grants.length.toLocaleString()}+ matches`}
</p>
</div>
<button
onClick={() => {
setSortBy(sortBy === 'deadline' ? 'award' : 'deadline');
loadGrants();
}}
className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
>
<ArrowUpDown className="w-4 h-4" />
Sort by {sortBy === 'deadline' ? 'Award' : 'Deadline'}
</button>
</div>

{/* UPGRADE BANNER FOR FREE USERS */}
{!isPro && grants.length >= 5 && (
<div className="mb-6 bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
<p className="text-emerald-200 mb-2 font-semibold">
You're seeing 5 of 8,000+ available grants. Upgrade to see all matches.
</p>
<button
onClick={handleUpgrade}
className="px-4 py-2 bg-emerald