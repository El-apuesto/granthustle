import { useState, useEffect } from 'react';
import { FileText, Download, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadDOCX } from '../utils/docxGenerator';

type TemplateType = 'federal' | 'foundation' | 'corporate' | 'arts';

interface ApplicationWizardProps {
  isPro: boolean;
}

interface Profile {
  org_name: string;
  eligibility: any;
}

interface PastSubmission {
  id: string;
  project_title: string;
  project_summary: string;
  requested_amount: string;
  project_duration: string;
  target_beneficiaries: string;
  measurable_outcomes: string;
  created_at: string;
}

const TEMPLATES = [
  {
    type: 'federal' as TemplateType,
    name: 'Federal/Government Grant',
    icon: '🏛️',
    description: 'For federal agencies and government programs',
  },
  {
    type: 'foundation' as TemplateType,
    name: 'Private Foundation',
    icon: '🏦',
    description: 'For private foundations and family trusts',
  },
  {
    type: 'corporate' as TemplateType,
    name: 'Corporate Grant',
    icon: '🏢',
    description: 'For corporate giving programs and CSR initiatives',
  },
  {
    type: 'arts' as TemplateType,
    name: 'Arts & Culture',
    icon: '🎨',
    description: 'For arts councils, NEA, and cultural organizations',
  },
];

export default function ApplicationWizard({ isPro }: ApplicationWizardProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pastSubmissions, setPastSubmissions] = useState<PastSubmission[]>([]);
  const [showPastSubmissions, setShowPastSubmissions] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectSummary: '',
    requestedAmount: '',
    projectDuration: '',
    targetBeneficiaries: '',
    measurableOutcomes: '',
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('org_name, eligibility')
        .eq('id', user.id)
        .maybeSingle();

      if (data) setProfile(data);
    };

    const loadPastSubmissions = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('id, project_title, project_summary, requested_amount, project_duration, target_beneficiaries, measurable_outcomes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setPastSubmissions(data);
    };

    loadProfile();
    loadPastSubmissions();
  }, [user]);

  const generateTemplate = () => {
    if (!profile || !selectedTemplate) return '';

    const eligibility = profile.eligibility || {};
    const location = eligibility.location || {};

    const templates: Record<TemplateType, string> = {
      federal: `FEDERAL GRANT APPLICATION

APPLICANT INFORMATION
Organization Name: ${profile.org_name}
Address: ${location.stateProvince || 'N/A'}, ${location.country || 'N/A'}
Legal Status: ${eligibility.entityType || 'N/A'}
Annual Budget: ${eligibility.annualRevenue || 'N/A'}

PROJECT INFORMATION
Project Title: ${formData.projectTitle || '[Enter project title]'}

Project Summary (250 words max):
${formData.projectSummary || '[Provide a brief overview of your project, including its purpose, target population, and expected outcomes]'}

Amount Requested: ${formData.requestedAmount || '[Enter amount]'}
Project Duration: ${formData.projectDuration || '[e.g., 12 months]'}

NEED STATEMENT
${eligibility.primaryFields?.join(', ') || '[Your field]'} organizations in ${location.stateProvince || '[location]'} face critical challenges that this project will address.

TARGET BENEFICIARIES
${formData.targetBeneficiaries || '[Describe who will benefit from this project, including any demographic focus]'}

${eligibility.demographics?.length > 0 ? `This project specifically serves: ${eligibility.demographics.join(', ')}` : ''}

PROJECT GOALS AND OBJECTIVES
[List 3-5 SMART goals that align with the funder's priorities]

METHODS AND ACTIVITIES
[Describe your approach, timeline, and specific activities]

MEASURABLE OUTCOMES
${formData.measurableOutcomes || '[List specific, quantifiable outcomes you will track]'}

BUDGET JUSTIFICATION
[Detailed breakdown of how funds will be used]

ORGANIZATIONAL CAPACITY
${profile.org_name} is at the ${eligibility.projectStage || 'operational'} stage.
${eligibility.fiscalSponsor === 'Yes' ? 'We have a 501(c)(3) fiscal sponsor.' : ''}

SUSTAINABILITY PLAN
[Describe how project impact will continue beyond the grant period]`,

      foundation: `PRIVATE FOUNDATION GRANT PROPOSAL

Organization: ${profile.org_name}
Location: ${location.stateProvince}, ${location.country}
Mission Alignment: ${eligibility.primaryFields?.join(', ') || '[Your mission]'}

EXECUTIVE SUMMARY
${formData.projectSummary || '[1-2 paragraph overview of your request]'}

PROJECT TITLE: ${formData.projectTitle || '[Enter title]'}
AMOUNT REQUESTED: ${formData.requestedAmount || '[Enter amount]'}

THE OPPORTUNITY
Our ${eligibility.projectStage || 'established'} organization serves ${eligibility.demographics?.join(', ') || 'the community'} in ${location.stateProvince}.

PROGRAM DESCRIPTION
${formData.projectTitle || 'This program'} will address critical needs in ${eligibility.primaryFields?.join(', ') || 'our focus area'}.

Target Population: ${formData.targetBeneficiaries || '[Describe beneficiaries]'}
Timeline: ${formData.projectDuration || '[Duration]'}

EXPECTED OUTCOMES
${formData.measurableOutcomes || '[List specific, measurable results]'}

BUDGET OVERVIEW
Total Project Cost: ${formData.requestedAmount || '[Amount]'}
[Include high-level budget categories]

WHY ${profile.org_name.toUpperCase()}
${eligibility.annualRevenue || 'As a small organization'}, we have deep community connections and proven impact.

CLOSING
Thank you for considering this request to support ${eligibility.primaryFields?.[0] || 'our mission'} in ${location.stateProvince}.`,

      corporate: `CORPORATE GIVING PROPOSAL

TO: [Corporate Foundation Name]
FROM: ${profile.org_name}
DATE: ${new Date().toLocaleDateString()}

PARTNERSHIP OPPORTUNITY

We are seeking ${formData.requestedAmount || '[amount]'} to support ${formData.projectTitle || '[project name]'}.

ALIGNMENT WITH CORPORATE VALUES
This project aligns with your commitment to:
• ${eligibility.primaryFields?.join('\n• ') || '[List aligned values]'}
• ${eligibility.demographics?.length > 0 ? `Supporting ${eligibility.demographics[0]} communities` : 'Community impact'}

THE BUSINESS CASE
ROI for Your Brand:
• Community engagement in ${location.stateProvince}
• Measurable social impact
• Employee engagement opportunities
• Marketing and PR value

PROJECT OVERVIEW
${formData.projectSummary || '[Brief project description]'}

Target Beneficiaries: ${formData.targetBeneficiaries || '[Who benefits]'}
Timeline: ${formData.projectDuration || '[Duration]'}

MEASURABLE IMPACT
${formData.measurableOutcomes || '[Specific metrics your company can report on]'}

INVESTMENT TIERS
Requested: ${formData.requestedAmount || '[Amount]'}
[Optional: Include recognition benefits]

ABOUT US
${profile.org_name} is a ${eligibility.entityType || 'organization'} with ${eligibility.annualRevenue || 'under $50k'} annual revenue.

NEXT STEPS
We'd love to discuss how this partnership can achieve your CSR goals while creating meaningful community impact.`,

      arts: `ARTS & CULTURE GRANT APPLICATION

ORGANIZATION
Name: ${profile.org_name}
Location: ${location.stateProvince}, ${location.country}
Artistic Discipline: ${eligibility.primaryFields?.includes('Arts & Culture') ? eligibility.primaryFields.join(', ') : 'Arts & Culture'}
Organization Stage: ${eligibility.projectStage || 'Established'}

PROJECT TITLE
${formData.projectTitle || '[Enter creative project title]'}

ARTISTIC VISION
${formData.projectSummary || '[Describe your artistic vision and how this project advances your creative practice]'}

AMOUNT REQUESTED: ${formData.requestedAmount || '[Enter amount]'}
PROJECT TIMELINE: ${formData.projectDuration || '[e.g., 6 months]'}

ARTISTIC MERIT
[Describe the artistic excellence and innovation of this project]

COMMUNITY ENGAGEMENT
Target Audience: ${formData.targetBeneficiaries || '[Describe who will experience/participate in this work]'}

${eligibility.demographics?.length > 0 ? `This project centers ${eligibility.demographics.join(', ')} voices and perspectives.` : ''}

ACCESSIBILITY & INCLUSION
[Describe how you'll make this work accessible to diverse audiences]

IMPACT & EVALUATION
${formData.measurableOutcomes || '[How will you measure artistic and community impact?]'}

Metrics:
• Attendance/participation numbers
• Audience demographics
• Community feedback
• Artistic outcomes

BUDGET NARRATIVE
Total Project Budget: ${formData.requestedAmount || '[Amount]'}
[Detailed budget showing artistic expenses, artist fees, materials, venue, marketing, etc.]

ARTIST/ORGANIZATIONAL BACKGROUND
${profile.org_name} has been creating ${eligibility.primaryFields?.[0] || 'art'} in ${location.stateProvince}.
${eligibility.fiscalSponsor === 'Yes' ? 'We operate under a 501(c)(3) fiscal sponsor.' : ''}

ARTISTIC WORK SAMPLES
[Include links or descriptions of previous work]`,
    };

    return templates[selectedTemplate];
  };

  const downloadAsWord = async () => {
    if (!profile || !selectedTemplate) return;

    const templateData = {
      templateType: selectedTemplate,
      orgName: profile.org_name,
      location: profile.eligibility?.location || {},
      eligibility: profile.eligibility || {},
      projectTitle: formData.projectTitle,
      projectSummary: formData.projectSummary,
      requestedAmount: formData.requestedAmount,
      projectDuration: formData.projectDuration,
      targetBeneficiaries: formData.targetBeneficiaries,
      measurableOutcomes: formData.measurableOutcomes,
    };

    await generateAndDownloadDOCX(templateData);

    await supabase.from('submissions').insert({
      user_id: user?.id,
      project_title: formData.projectTitle,
      project_summary: formData.projectSummary,
      requested_amount: formData.requestedAmount,
      project_duration: formData.projectDuration,
      target_beneficiaries: formData.targetBeneficiaries,
      measurable_outcomes: formData.measurableOutcomes,
      template_type: selectedTemplate,
      status: 'draft',
    });
  };

  const copyFromPast = (submission: PastSubmission) => {
    setFormData({
      projectTitle: submission.project_title,
      projectSummary: submission.project_summary,
      requestedAmount: submission.requested_amount,
      projectDuration: submission.project_duration,
      targetBeneficiaries: submission.target_beneficiaries,
      measurableOutcomes: submission.measurable_outcomes,
    });
    setShowPastSubmissions(false);
  };

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Application Templates are Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access 4 pre-filled templates that save you hours of writing.
        </p>
        <button className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors">
          Upgrade for $9.99/month
        </button>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Choose a template</h2>
        <p className="text-slate-400 mb-6">
          Pick the template that matches your grant type. We'll pre-fill it with your info.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {TEMPLATES.map(template => (
            <button
              key={template.type}
              onClick={() => setSelectedTemplate(template.type)}
              className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 text-left hover:border-emerald-500 transition-colors"
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-slate-400 text-sm">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="text-emerald-500 hover:text-emerald-400 mb-4"
        >
          ← Back to templates
        </button>
        <h2 className="text-xl font-semibold text-white mb-2">
          {TEMPLATES.find(t => t.type === selectedTemplate)?.name}
        </h2>
        <p className="text-slate-400">
          Fill in the details below. We'll pre-fill everything else from your profile.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        {pastSubmissions.length > 0 && (
          <div className="mb-6 pb-6 border-b border-slate-700">
            <button
              onClick={() => setShowPastSubmissions(!showPastSubmissions)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy from Past Application
            </button>
            {showPastSubmissions && (
              <div className="mt-4 space-y-2">
                {pastSubmissions.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => copyFromPast(sub)}
                    className="w-full text-left px-4 py-3 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    <div className="font-medium text-white">{sub.project_title}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Title
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Give your project a clear, compelling title"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Summary (2-3 sentences)
            </label>
            <textarea
              value={formData.projectSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={4}
              placeholder="What are you doing and why does it matter?"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Requested Amount
              </label>
              <input
                type="text"
                value={formData.requestedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="$10,000"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Project Duration
              </label>
              <input
                type="text"
                value={formData.projectDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDuration: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="12 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Target Beneficiaries
            </label>
            <textarea
              value={formData.targetBeneficiaries}
              onChange={(e) => setFormData(prev => ({ ...prev, targetBeneficiaries: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="Who benefits from this project?"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Measurable Outcomes
            </label>
            <textarea
              value={formData.measurableOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, measurableOutcomes: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="What specific results will you track?"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96 bg-slate-900 p-4 rounded">
          {generateTemplate()}
        </pre>
      </div>

      <button
        onClick={downloadAsWord}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download as Word Doc
      </button>
    </div>
  );
}
