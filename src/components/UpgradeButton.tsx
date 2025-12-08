"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type Tier = "basic" | "standard" | "pro" | "enterprise";

const TIERS: Record<
  Tier,
  { price: string; label: string; desc: string; color: string }
> = {
  basic: {
    price: "$9.99",
    label: "Basic",
    desc: "Start unlocking better grants.",
    color: "emerald",
  },
  standard: {
    price: "$27.99",
    label: "Standard",
    desc: "Unlimited matches + templates.",
    color: "blue",
  },
  pro: {
    price: "$79.99",
    label: "PRO",
    desc: "For power-hunters applying daily.",
    color: "purple",
  },
  enterprise: {
    price: "$199.99",
    label: "Enterprise",
    desc: "Agencies, teams, large organizations.",
    color: "amber",
  },
};

const PRICE_MAP: Record<Tier, string> = {
  basic: "price_1Sa8yzG85r4wkmwW8CGlyij4",
  standard: "price_1Sa918G85r4wkmwW786cBMaH",
  pro: "price_1Sa9BPG85r4wkmwWd0BQE2vz",
  enterprise: "price_1SbWyQG85r4wkmwWKFT2dwlf",
};

export default function UpgradeButton() {
  const [loading, setLoading] = useState<Tier | null>(null);

  const startCheckout = async (tier: Tier) => {
    try {
      setLoading(tier);

      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load.");
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRICE_MAP[tier] }),
      });

      const data = await res.json();

      if (!data?.id) {
        alert("Checkout session error.");
        return;
      }

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-8">
      {Object.entries(TIERS).map(([key, tier]) => {
        const id = key as Tier;

        return (
          <div
            key={id}
            className={`rounded-2xl p-6 shadow-xl border border-slate-700 bg-slate-800/40 backdrop-blur-sm hover:scale-[1.02] transition transform`}
          >
            <h3 className="text-xl font-bold text-white flex justify-between">
              <span>{tier.label}</span>
              <span className="text-slate-300">{tier.price}/mo</span>
            </h3>

            <p className="text-slate-400 text-sm mt-2 mb-6">
              {tier.desc}
            </p>

            <button
              onClick={() => startCheckout(id)}
              disabled={loading === id}
              className={`w-full py-3 rounded-xl text-white font-semibold bg-${tier.color}-600 hover:bg-${tier.color}-700 transition disabled:opacity-50`}
            >
              {loading === id ? "Loading…" : `Upgrade to ${tier.label}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
