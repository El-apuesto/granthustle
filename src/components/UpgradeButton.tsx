// src/components/UpgradeButton.tsx

"use client";

import React, { useState } from "react";
import { getStripe } from "../lib/stripe/load-stripe";

type Tier = "basic" | "standard" | "pro" | "enterprise";

// Price labels for the UI
const PRICE_LABELS: Record<Tier, string> = {
  basic: "$9.99",
  standard: "$27.99",
  pro: "$79.99",
  enterprise: "$199.99",
};

// ✅ (STEP 2) PRICE MAP GOES HERE — maps tiers → your Stripe price IDs
const PRICE_MAP: Record<Tier, string> = {
  basic: "price_1Sa8yzG85r4wkmwW8CGlyij4",
  standard: "price_1Sa918G85r4wkmwW786cBMaH",
  pro: "price_1Sa9BPG85r4wkmwWd0BQE2vz",
  enterprise: "price_1SbWyQG85r4wkmwWKFT2dwlf",
};

export default function UpgradeButton() {
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);

  const handleUpgrade = async (tier: Tier) => {
    try {
      setLoadingTier(tier);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // ✅ (STEP 3) send the Stripe priceId, NOT the tier name
        body: JSON.stringify({
          priceId: PRICE_MAP[tier],
        }),
      });

      if (!response.ok) {
        alert("Could not start checkout.");
        setLoadingTier(null);
        return;
      }

      const data = await response.json();

      // ✅ (STEP 4) redirect using the URL returned by your API
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Invalid checkout response.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Network error. Try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid gap-4">
      {(["basic", "standard", "pro", "enterprise"] as Tier[]).map((tier) => (
        <button
          key={tier}
          onClick={() => handleUpgrade(tier)}
          disabled={loadingTier === tier}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors w-full disabled:opacity-60"
        >
          {loadingTier === tier
            ? "Processing…"
            : `Upgrade for ${PRICE_LABELS[tier]}`}
        </button>
      ))}
    </div>
  );
}
