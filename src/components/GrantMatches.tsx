import { Lock } from "lucide-react";

interface GrantMatchesProps {
  onUpgrade: () => void;
}

export default function GrantMatches({ onUpgrade }: GrantMatchesProps) {
  const hasReachedLimit = true;

  if (!hasReachedLimit) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6">My Matches</h2>
        <p className="text-slate-300">Your grant matches will appear here soon...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-3xl p-10 max-w-md w-full text-center border border-emerald-500/30">
        <div className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-14 h-14 text-red-500" />
        </div>

        <h2 className="text-4xl font-black text-white mb-6">
          Monthly Limit Reached
        </h2>

        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
          You've used all 5 of your free monthly searches.
        </p>

        <button
          onClick={onUpgrade}
          className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-bold rounded-2xl transition transform hover:scale-105"
        >
          Upgrade for $9.99/1st month
        </button>

        <p className="text-sm text-slate-500 mt-8">
          Your limit resets on the 1st of next month
        </p>
      </div>
    </div>
  );
}