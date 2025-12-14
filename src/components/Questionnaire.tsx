import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface QuestionnaireData {
  location: {
    country: string;
    stateProvince: string;
  };
  entityType: string;
  annualRevenue: string;
  primaryFields: string[];
  demographics: string[];
  projectStage: string;
  fiscalSponsor: string;
}

const COUNTRIES = ['USA', 'Canada'];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

const ENTITY_TYPES = [
  'Individual',
  'Unincorporated group',
  '501(c)(3) or equivalent',
  'For-profit',
  'Other'
];

const REVENUE_OPTIONS = [
  '<$50k',
  '$50k–$250k',
  '$250k–$1M',
  '>$1M',
  'Not founded yet'
];

const PRIMARY_FIELDS = [
  'Arts & Culture',
  'Environment',
  'Health',
  'Education',
  'Housing',
  'Tech',
  'Social Justice',
  'Other'
];

const DEMOGRAPHICS = [
  'Women-led',
  'BIPOC-led',
  'LGBTQ+-led',
  'Rural',
  'Veterans',
  'Disabled',
  'Immigrants',
  'Youth-led',
  'None'
];

const PROJECT_STAGES = [
  'Idea',
  'Prototype',
  'Operating 1–3 years',
  'Scaling'
];

const FISCAL_SPONSOR_OPTIONS = ['Yes', 'No', 'Maybe'];

interface QuestionnaireProps {
  onComplete: () => void;
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<QuestionnaireData>({
    location: { country: '', stateProvince: '' },
    entityType: '',
    annualRevenue: '',
    primaryFields: [],
    demographics: [],
    projectStage: '',
    fiscalSponsor: '',
  });

  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('eligibility')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile?.eligibility) {
        setData({
          location: profile.eligibility.location || { country: '', stateProvince: '' },
          entityType: profile.eligibility.entityType || '',
          annualRevenue: profile.eligibility.annualRevenue || '',
          primaryFields: profile.eligibility.primaryFields || [],
          demographics: profile.eligibility.demographics || [],
          projectStage: profile.eligibility.projectStage || '',
          fiscalSponsor: profile.eligibility.fiscalSponsor || '',
        });
      }
    };

    loadExistingData();
  }, [user]);

  const statesProvinces = data.location.country === 'USA' ? US_STATES :
                          data.location.country === 'Canada' ? CANADIAN_PROVINCES : [];

  const toggleArrayField = (field: 'primaryFields' | 'demographics', value: string) => {
    setData(prev => {
      const current = prev[field];
      const maxSelections = field === 'primaryFields' ? 3 : 999;

      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else if (current.length < maxSelections) {
        return { ...prev, [field]: [...current, value] };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          eligibility: data,
          questionnaire_completed: true,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onComplete();
    } catch (err) {
      setError('Failed to save. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.location.country && data.location.stateProvince;
      case 2: return data.entityType;
      case 3: return data.annualRevenue;
      case 4: return data.primaryFields.length > 0;
      case 5: return true;
      case 6: return data.projectStage;
      case 7: return data.fiscalSponsor;
      default: return false;
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-white">
              Your rich uncle died but you have to fill this out first
            </h1>
            <span className="text-slate-400 text-sm">{step}/7</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Where are you?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Country</label>
                  <select
                    value={data.location.country}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      location: { country: e.target.value, stateProvince: '' }
                    }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {data.location.country && (
                  <div>
                    <label className="block text-slate-300 mb-2">State/Province</label>
                    <select
                      value={data.location.stateProvince}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        location: { ...prev.location, stateProvince: e.target.value }
                      }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">Select state/province</option>
                      {statesProvinces.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What kind of entity are you?</h2>
              <div className="space-y-2">
                {ENTITY_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setData(prev => ({ ...prev, entityType: type }))}
                    className={`w-full text-left px-4 py-3 rounded border-2 transition-all ${
                      data.entityType === type
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Annual revenue last year?</h2>
              <div className="space-y-2">
                {REVENUE_OPTIONS.map(rev => (
                  <button
                    key={rev}
                    onClick={() => setData(prev => ({ ...prev, annualRevenue: rev }))}
                    className={`w-full text-left px-4 py-3 rounded border-2 transition-all ${
                      data.annualRevenue === rev
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {rev}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Primary field (pick up to 3)</h2>
              <p className="text-slate-400 text-sm mb-4">Selected: {data.primaryFields.length}/3</p>
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_FIELDS.map(field => (
                  <button
                    key={field}
                    onClick={() => toggleArrayField('primaryFields', field)}
                    disabled={!data.primaryFields.includes(field) && data.primaryFields.length >= 3}
                    className={`px-4 py-3 rounded border-2 transition-all ${
                      data.primaryFields.includes(field)
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Demographic focus or leadership</h2>
              <p className="text-slate-400 text-sm mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMOGRAPHICS.map(demo => (
                  <button
                    key={demo}
                    onClick={() => toggleArrayField('demographics', demo)}
                    className={`px-4 py-3 rounded border-2 transition-all ${
                      data.demographics.includes(demo)
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {demo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Project stage?</h2>
              <div className="space-y-2">
                {PROJECT_STAGES.map(stage => (
                  <button
                    key={stage}
                    onClick={() => setData(prev => ({ ...prev, projectStage: stage }))}
                    className={`w-full text-left px-4 py-3 rounded border-2 transition-all ${
                      data.projectStage === stage
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Do you have (or can you get) a 501(c)(3) fiscal sponsor?
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Some grants require this. Don't panic if you said no—lots don't.
              </p>
              <div className="space-y-2">
                {FISCAL_SPONSOR_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => setData(prev => ({ ...prev, fiscalSponsor: option }))}
                    className={`w-full text-left px-4 py-3 rounded border-2 transition-all ${
                      data.fiscalSponsor === option
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < 7 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : "Let's find you money"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
