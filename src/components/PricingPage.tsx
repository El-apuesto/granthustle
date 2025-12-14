import { Check } from 'lucide-react';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'intro' | 'season' | 'annual') => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stop being broke. Start applying.
          </h1>
          <p className="text-xl text-slate-300">
            Zero corporate BS. Just grants that actually want to give you money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Free Tier</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>5 matches per month</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Calendar view only</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-5 h-5 flex-shrink-0"></span>
                <span>No templates</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-5 h-5 flex-shrink-0"></span>
                <span>No saved grants</span>
              </li>
            </ul>
            <button
              onClick={() => onSelectPlan('free')}
              className="w-full py-3 bg-slate-700 text-white rounded font-semibold hover:bg-slate-600 transition-colors"
            >
              Start Free
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-500 rounded-lg p-6 flex flex-col relative lg:col-span-2 lg:scale-105 lg:shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
              BEST DEAL
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Intro Offer</h3>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-white/80">first 30 days</span>
              </div>
              <div className="text-white/90 text-sm mt-1">
                Then $27.99/month (cancel anytime)
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">Unlimited matches</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>4 application templates (auto-filled)</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Deadline reminders (30/14/7/3/1 day)</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>LOI generator</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Calendar export (Google/Outlook)</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Unlimited saved grants</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/eVqeVd2Jh9mf82o7Uf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white text-emerald-700 rounded font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg text-center block"
            >
              Start for $9.99/month
            </a>
          </div>

          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Season Pass</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$79.99</span>
              <span className="text-slate-400 block text-sm">one-time</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">4 months full Pro access</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>All Pro features</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Then drops to Free tier</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400 text-sm">
                <span className="w-5 h-5 flex-shrink-0"></span>
                <span>Perfect for grant season</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/aFafZhfw31TNciE8Yj"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-slate-700 text-white rounded font-semibold hover:bg-slate-600 transition-colors text-center block"
            >
              Buy Season Pass
            </a>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Annual Pass</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$149.99</span>
              <span className="text-slate-400 block text-sm">one-time payment</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">12 months full Pro access</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>All Pro features included</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Save $199 vs monthly</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/7sY8wP1Fd7e75Ug4I3"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors text-center block"
            >
              Buy Annual Pass
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            All paid plans include unlimited matches, 4 templates, deadline reminders, LOI generator, calendar export, and saved grants.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Cancel anytime. No tricks, no bullshit.
          </p>
        </div>
      </div>
    </div>
  );
}
