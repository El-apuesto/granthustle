"use client";
import React from "react";

type Tier = "intro" | "season" | "annual";

const TIERS: Record<
  Tier,
  { priceLabel: string; stripeUrl: string; description: string }
> = {
  intro: {
    priceLabel: "$9.99/mo",
    stripeUrl: "https://buy.stripe.com/eVqeVd2Jh9mf82o7Uf",
    description: "First 30 days, then $27.99/mo",
  },
  season: {
    priceLabel: "$79.99",
    stripeUrl: "https://buy.stripe.com/aFafZhfw31TNciE8Yj",
    description: "4 months Pro access (one-time)",
  },
  annual: {
    priceLabel: "$149.99",
    stripeUrl: "https://buy.stripe.com/7sY8wP1Fd7e75Ug4I3",
    description: "12 months Pro access (one-time)",
  },
};

export default function UpgradeButton() {
  return (
    <div className="grid gap-4">
      {(["intro", "season", "annual"] as Tier[]).map((t) => {
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
              <a
                href={tier.stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 inline-block"
              >
                Upgrade
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
