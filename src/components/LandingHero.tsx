// src/components/LandingHero.tsx
"use client";

import React from "react";
import Logo from "./Logo";
import UpgradeButton from "./UpgradeButton";

interface Props {
  onGetStarted?: () => void;
  onSubscribe?: () => void;
  logoSrc?: string | null;
}

export default function LandingHero({ onGetStarted, logoSrc }: Props) {
  return (
    <section className="min-h-screen flex flex-col">
      <header className="w-full border-b border-slate-700/40 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={44} imageSrc={logoSrc} />
            <div>
              <div className="text-white font-bold text-xl">GrantHustle</div>
              <div className="text-slate-400 text-xs">Find opportunities. Win grants.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-transparent border border-emerald-500 text-emerald-400 rounded-lg hover:bg-emerald-800/20 transition"
            >
              Get Started
            </button>

            <a
              href="#subscribe"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Subscribe
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6">
              Your rich uncle died — <br />
              <span className="text-emerald-400">but you have to fill this out first.</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl">
              Stop drowning in grant portals and government gibberish. We find money that actually wants you
              to have it — and get you matched fast.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                Find My Money (5 free matches)
              </button>

              <a href="#subscribe" className="inline-block">
                <button
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg"
                >
                  Subscribe Now — $9.99 1st month
                  <span className="block text-sm opacity-80">then $27.99/mo — cancel anytime</span>
                </button>
              </a>
            </div>

            <p className="text-slate-400 text-sm mt-6">Free tier: 5 matches/month · No credit card required</p>
          </div>

          {/* Right - sleek product card / image / place for logo preview */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/30 border border-slate-700/40 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Logo size={40} imageSrc={logoSrc} />
                  <div>
                    <div className="text-white font-semibold">GrantHustle Pro</div>
                    <div className="text-slate-400 text-xs">Unlimited matches · Templates · Priority support</div>
                  </div>
                </div>
                <div className="text-emerald-400 font-bold text-lg">$9.99</div>
              </div>

              <ul className="text-slate-300 text-sm space-y-2 mb-6">
                <li>• Unlimited grant matches</li>
                <li>• Auto-applied filters for eligibility</li>
                <li>• Application templates & LOI generator</li>
              </ul>

              <UpgradeButton />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700/30 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          Built for nonprofits, artists, and solopreneurs who hate corporate bullshit. Cancel anytime.
        </div>
      </footer>
    </section>
  );
}
