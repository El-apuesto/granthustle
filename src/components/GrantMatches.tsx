// src/components/GrantMatches.tsx
"use client";

import { useState } from "react";
import UpgradeButton from "./UpgradeButton";

interface Grant {
  id: string;
  title: string;
}

interface Props {
  matches: Grant[];
}

export default function GrantMatches({ matches }: Props) {
  const [limitReached, setLimitReached] = useState(false);

  const handleUseMatch = () => {
    // TODO: connect your match-limit logic
    const hitLimit = false;

    if (hitLimit) {
      setLimitReached(true);
    }
  };

  return (
    <div>
      {limitReached && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">You've used all free matches</h2>
            <p className="opacity-80 mb-6">
              Upgrade to continue matching.
            </p>

            <UpgradeButton />
          </div>
        </div>
      )}

      <div>
        {matches?.map((m) => (
          <div
            key={m.id}
            className="p-4 border-b cursor-pointer"
            onClick={handleUseMatch}
          >
            {m.title}
          </div>
        ))}
      </div>
    </div>
  );
}
