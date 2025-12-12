"use client";
import { DollarSign } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LandingProps {
  onGetStarted: () => void;
  onViewPricing?: () => void; // Add this if you want to navigate to pricing page
}

export default function Landing({ onGetStarted, onViewPricing }: LandingProps) {
  const { user } = useAuth();

  // Simple navigation to pricing page
  const handleViewPricing = () => {
    if (onViewPricing) {
      onViewPricing();
    } else {
      window.location.href = '/pricing';
    }
  };

  // Direct Stripe checkout link (using your existing Stripe link)
  const handleDirectCheckout = () => {
    window.location.href = 'https://buy.stripe.com/eVqeVd2Jh9mf82o7Uf';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* NAV */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-white">GrantHustle</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <img 
          src="/favicon.png" 
          alt="GrantHustle Logo" 
          className="w-32 h-32 mx-auto mb-8"
        />
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Your rich uncle died<br />
          <span className="text-emerald-500">but you have to fill this out first</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Stop drowning in grant portals and government gibberish. We find money
          that actually wants you to have it.
        </p>

        {/* FREE TIER BUTTON */}
        <button
          onClick={onGetStarted}
          className="px-10 py-5 bg-white text-emerald-700 text-2xl rounded-xl font-bold hover:bg-gray-100 transition mb-6"
        >
          Find My Money (5 free matches)
        </button>

        {/* OPTION 1: Go to pricing page to see all plans */}
        <button
          onClick={handleViewPricing}
          className="block mx-auto px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl rounded-2xl shadow-2xl transition transform hover:scale-105 mb-4"
        >
          Subscribe Now – $9.99 first month<br />
          <span className="text-lg">then $27.99/month (cancel anytime)</span>
        </button>

        {/* OPTION 2: Or add a "View All Plans" button */}
        <button
          onClick={handleViewPricing}
          className="text-emerald-400 hover:text-emerald-300 underline text-lg transition"
        >
          View all pricing options
        </button>

        <p className="text-slate-400 mt-8 text-lg">
          Free tier: 5 matches/month · No credit card required
        </p>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-32">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p className="mb-2">
            Built for nonprofits, artists, and solopreneurs who hate corporate bullshit.
          </p>
          <p>Cancel anytime. No tricks. Actually works.</p>
        </div>
      </footer>
    </div>
  );
}
