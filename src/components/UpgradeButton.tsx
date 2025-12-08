"use client";

import React, { useState } from "react";
import { getStripe } from "../lib/stripe/load-stripe";

type Tier = "basic" | "standard" | "pro" | "enterprise";

const PRICE_LABELS: Record<Tier, string> = {
  basic: "$9.99",
  standard: "$27.99",
  pro: "$79.99",
  enterprise: "$199.99",
};

export default function UpgradeButton() {
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);

  const handleUpgrade = async (tier: Tier) => {
    try {
      setLoadingTier(tier);

      const stripe = await getStripe();

      const response = await fetch("http://localhost:4242/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        alert("Could not start checkout.");
        setLoadingTier(null);
        return;
      }

      const data = await response.json();

      if (data?.id) {
        stripe?.redirectToCheckout({ sessionId: data.id });
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
          {loadingTier === tier ? "Processing…" : `Upgrade for ${PRICE_LABELS[tier]}`}
        </button>
      ))}
    </div>
  );
}
