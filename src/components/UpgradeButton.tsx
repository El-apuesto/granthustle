"use client";

import React, { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        alert("Could not start checkout.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Invalid checkout response.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors w-full disabled:opacity-60"
    >
      {loading ? "Processing…" : "Upgrade for $9.99"}
    </button>
  );
}
