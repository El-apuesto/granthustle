import { useState, useEffect } from 'react';
import { Search, ExternalLink, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FiscalSponsor {
  id: string;
  name: string;
  location: string;
  city?: string;
  state?: string;
  focus_areas: string[];
  fee_range?: string;
  website_url?: string;
  description?: string;
}

interface FiscalSponsorMatcherProps {
  isPro: boolean;
}

export default function FiscalSponsorMatcher({ isPro }: FiscalSponsorMatcherProps) {
  const [sponsors, setSponsors] = useState<FiscalSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string>('All');
  const [allFocusAreas, setAllFocusAreas] = useState<string[]>(['All']);

  useEffect(() => {
    if (isPro) {
      fetchSponsors();
    }
  }, [isPro]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fiscal_sponsors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      if (data) {
        setSponsors(data);
        
        // Extract unique focus areas
        const focusSet = new Set<string>();
        data.forEach((sponsor: FiscalSponsor) => {
          sponsor.focus_areas.forEach((focus: string) => focusSet.add(focus));
        });
        setAllFocusAreas(['All', ...Array.from(focusSet).sort()]);
      }
    } catch (error) {
      console.error('Error fetching fiscal sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = searchQuery === '' ||
      sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.focus_areas.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sponsor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.state?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFocus = selectedFocus === 'All' || sponsor.focus_areas.includes(selectedFocus);

    return matchesSearch && matchesFocus;
  });

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Fiscal Sponsor Matcher is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access our curated database of 401+ fiscal sponsors.
        </p>
        <button className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors">
          Upgrade for $9/month
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-400">Loading fiscal sponsors...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Find a Fiscal Sponsor</h2>
        <p className="text-slate-400">
          Browse {sponsors.length}+ trusted fiscal sponsors from FiscalSponsorDirectory.org. Filter by focus area and find the right fit for your project.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, focus area, location, or description..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allFocusAreas.slice(0, 15).map(focus => (
            <button
              key={focus}
              onClick={() => setSelectedFocus(focus)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedFocus === focus
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {focus}
            </button>
          ))}
          {allFocusAreas.length > 15 && (
            <button className="px-4 py-2 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
              +{allFocusAreas.length - 15} more
            </button>
          )}
        </div>
      </div>

      <div className="text-slate-400 mb-4">
        {filteredSponsors.length} sponsors found
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredSponsors.map(sponsor => (
          <div
            key={sponsor.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{sponsor.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {sponsor.location}
                  </span>
                  {sponsor.fee_range && (
                    <span className="text-slate-400">
                      Fee: {sponsor.fee_range}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {sponsor.focus_areas.map(f => (
                    <span
                      key={f}
                      className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {sponsor.description && (
              <p className="text-slate-300 mb-4">{sponsor.description}</p>
            )}

            {sponsor.website_url && (
              <a
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No sponsors found matching your criteria. Try a different search or filter.
        </div>
      )}
    </div>
  );
}
