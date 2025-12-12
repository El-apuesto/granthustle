"use client";

import React, { useState } from "react";

export default function GrantMatches({ matches }: { matches: { id: string; title: string }[] }) {
  const [limitReached, setLimitReached] = useState(false);

  const handleUseMatch = () => {
    // In real app this would check actual usage
    setLimitReached(true);
  };

  const handleUpgrade = () => {
    window.location.href = "https://buy.stripe.com/your_lifetime_or_monthly_price_id_here";
    // Replace the URL above with your real Stripe checkout link
  };

  return (
    <div>
      {/* Upgrade Modal when limit reached */}
      {limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">You've Hit Your Free Limit</h2>
            <p className="text-slate-300 mb-8 text-lg">
              You've used all 5 free grant matches this month.
              <br />
              Upgrade now to unlock unlimited searches.
            </p>

            {/* BIG WORKING UPGRADE BUTTON */}
            <button
              onClick={handleUpgrade}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-bold rounded-xl transition transform hover:scale-105 shadow-lg mb-4"
            >
              Upgrade Now – $149 Lifetime
            </button>

            <button
              onClick={() => setLimitReached(false)}
              className="text-slate-400 hover:text-white text-sm underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Grant List */}
      <div className="space-y-4">
        {matches?.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No grants found yet. Try searching!</p>
        ) : (
          matches.map((grant) => (
            <div
              key={grant.id}
              onClick={handleUseMatch}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-white">{grant.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );"use client";

import React, { useState } from "react";

export default function GrantMatches({ matches }: { matches: { id: string; title: string }[] }) {
  const [limitReached, setLimitReached] = useState(false);

  const handleUseMatch = () => {
    // In real app this would check actual usage
    setLimitReached(true);
  };

  const handleUpgrade = () => {
    window.location.href = "https://buy.stripe.com/your_lifetime_or_monthly_price_id_here";
    // Replace the URL above with your real Stripe checkout link
  };

  return (
    <div>
      {/* Upgrade Modal when limit reached */}
      {limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">You've Hit Your Free Limit</h2>
            <p className="text-slate-300 mb-8 text-lg">
              You've used all 5 free grant matches this month.
              <br />
              Upgrade now to unlock unlimited searches.
            </p>

            {/* BIG WORKING UPGRADE BUTTON */}
            <button
              onClick={handleUpgrade}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-bold rounded-xl transition transform hover:scale-105 shadow-lg mb-4"
            >
              Upgrade Now – $149 Lifetime
            </button>

            <button
              onClick={() => setLimitReached(false)}
              className="text-slate-400 hover:text-white text-sm underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Grant List */}
      <div className="space-y-4">
        {matches?.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No grants found yet. Try searching!</p>
        ) : (
          matches.map((grant) => (
            <div
              key={grant.id}
              onClick={handleUseMatch}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-white">{grant.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
}
