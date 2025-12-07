// src/components/UpgradeButton.tsx
"use client";

export default function UpgradeButton() {
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.assign(url);
    } catch (err) {
      alert("Payment failed – try again or contact support");
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
    >
      Upgrade to Pro
    </button>
  );
}
