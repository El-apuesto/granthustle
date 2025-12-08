// src/components/UpgradeButton.tsx
"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type Tier = "basic" | "standard" | "pro" | "enterprise";

const TIERS: Record<
  Tier,
  { priceLabel: string; priceId: string; description: string; accent: string }
> = {
  basic: {
    priceLabel: "$9.99",
    priceId: "price_1Sa8yzG85r4wkmwW8CGlyij4",
    description: "Starter — perfect for occasional searches",
    accent: "emerald",
  },
  standard: {
    priceLabel: "$27.99",
    priceId: "price_1Sa918G85r4wkmwW786cBMaH",
    description: "Most popular — unlimited matches",
    accent: "blue",
  },
  pro: {
    priceLabel: "$79.99",
    priceId: "price_1Sa9BPG85r4wkmwWd0BQE2vz",
    description: "Power user — templates + LOI + priority support",
    accent: "purple",
  },
  enterprise: {
    priceLabel: "$199.99",
    priceId: "price_1SbWyQG85r4wkmwWKFT2dwlf",
    description: "Team & agency solutions",
    accent: "amber",
  },
};

export default function UpgradeButton() {
  const [loading, setLoading] = useState<Tier | null>(null);

  const startCheckout = async (tier: Tier) => {
    setLoading(tier);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to initialize.");
        setLoading(null);
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: TIERS[tier].priceId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.id) {
        console.error("Checkout session creation failed:", data);
        alert(data?.error || "Unable to start checkout.");
        setLoading(null);
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if ((result as any)?.error) {
        console.error("Stripe redirect error:", (result as any).error);
        alert((result as any).error.message || "Stripe redirect failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-4">
      {(["basic", "standard", "pro", "enterprise"] as Tier[]).map((t) => {
        const tier = TIERS[t];
        return (
          <div
            key={t}
            className="rounded-2xl p-4 bg-slate-800/40 border border-slate-700 shadow-lg flex items-center justify-between"
          >
            <div>
              <div className="flex items-baseline gap-3">
                <div className="text-xl font-bold text-white">{tier.priceLabel}</div>
                <div className="text-sm text-slate-400">{tier.description}</div>
              </div>
            </div>

            <div>
              <button
                onClick={() => startCheckout(t)}
                disabled={loading === t}
                className={`px-4 py-2 rounded-lg font-semibold text-white ${
                  loading === t ? "opacity-60" : `bg-emerald-600 hover:bg-emerald-700`
                }`}
                // note: accent colors inlined to simplify; you can add dynamic tailwind classes with classnames if desired
              >
                {loading === t ? "Processing…" : `Upgrade`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
