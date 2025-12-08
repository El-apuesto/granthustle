// src/components/GrantMatches.tsx
"use client";

import React, { useState } from "react";
import UpgradeButton from "./UpgradeButton";

interface Grant { id: string; title: string; }
interface Props { matches: Grant[]; }

export default function GrantMatches({ matches }: Props) {
  const [limitReached, setLimitReached] = useState(false);

  const handleUseMatch = () => {
    const hitLimit = true; // toggle for testing
    if (hitLimit) setLimitReached(true);
  };

  return (
    <div>
      {limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-3">Monthly Limit Reached</h2>
            <p className="text-slate-300 mb-4">You've used all 5 of your free monthly searches.</p>

            <UpgradeButton />

            <button
              onClick={() => setLimitReached(false)}
              className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-white transition"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div>
        {matches?.map((m) => (
          <div key={m.id} className="p-4 border-b cursor-pointer text-white" onClick={handleUseMatch}>
            {m.title}
          </div>
        ))}
      </div>
    </div>
  );
}
