import { DollarSign, Calendar, FileText, Zap } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-white">GrantHustle</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your rich uncle died<br />
            <span className="text-emerald-500">but you have to fill this out first</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Stop drowning in grant portals and government gibberish. We find money that actually wants you to have it.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-emerald-600 text-white text-lg rounded-lg font-bold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Find My Money
          </button>
          <p className="text-slate-400 mt-4 text-sm">
            Free tier: 5 matches/month. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">100% Match Guaranteed</h3>
            <p className="text-slate-400">
              Only see grants you actually qualify for. Zero wasted time on dead-ends.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Auto-Fill Templates</h3>
            <p className="text-slate-400">
              4 battle-tested templates pre-filled with your info. Export to Word/PDF.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Never Miss a Deadline</h3>
            <p className="text-slate-400">
              Reminders at 30/14/7/3/1 days. Sync to Google Calendar or Outlook.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">For Broke Founders</h3>
            <p className="text-slate-400">
              Built for nonprofits, artists, and solopreneurs with under $50k revenue.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            How it works (actually simple)
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Answer 7 Questions</h3>
              <p className="text-slate-400">
                Tell us about your project once. We remember forever.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Perfect Matches</h3>
              <p className="text-slate-400">
                See only grants you qualify for, sorted by deadline and award size.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Apply Fast</h3>
              <p className="text-slate-400">
                Use pre-filled templates and LOI generator. Export and submit.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop being broke. Start applying.
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Your first 5 matches are free. Upgrade when you're ready to hustle.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-emerald-700 text-lg rounded-lg font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Find Grants Now
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p className="mb-2">Built for nonprofits, artists, and solopreneurs who hate corporate bullshit.</p>
            <p>Cancel anytime. No tricks. Actually works.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
