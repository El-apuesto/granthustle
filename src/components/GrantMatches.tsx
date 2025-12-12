"use client";
import React, { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getStripe } from "../lib/stripe/load-stripe"; // ADD THIS IMPORT

interface GrantMatchesProps {
  matches?: { id: string; title: string }[];
  onUpgrade?: () => void;
}

export default function GrantMatches({ matches = [], onUpgrade }: GrantMatchesProps) {
  const [limitReached, setLimitReached] = useState(false);
  const { user } = useAuth();

  const handleUseMatch = () => {
    setLimitReached(true);
  };

  const handleUpgrade = useCallback(async () => {
  try {
    setLoading(true);

    // This will work on Vercel (uses /api routes)
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: "price_1Sa9BPG85r4wkmwWd0BQE2vz", // Your Pro tier price
        userId: user?.id || null,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      console.error("No redirect URL returned:", data);
      alert("Unable to start subscription checkout. Try again.");
    }
  } catch (err) {
    console.error("Stripe session error:", err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}, [user]);

  return (
    <div>
      {/* Upgrade Modal when limit reached */}
      {limitReached && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">
              You've Hit Your Free Limit
            </h3>
            <p className="text-slate-300 mb-6">
              You've used all 5 free grant matches this month.
              
              Upgrade now to unlock unlimited searches.
            </p>
            
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg mb-4 text-lg"
            >
              Upgrade Now – $9.99 first month
              <br />
              <span className="text-sm opacity-90">then $27.99/month</span>
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
      <div>
        {matches?.length === 0 ? (
          <p>No grants found yet. Try searching!</p>
        ) : (
          matches.map((grant) => (
            <div key={grant.id}>
              <h4>{grant.title}</h4>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
