// src/components/UpgradeButton.tsx
"use client";

export default function UpgradeButton() {
  const handleClick = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed");

      const { url } = await res.json();

      if (url) {
        window.location.assign(url); // this one NEVER fails
      } else {
        alert("No checkout URL received");
      }
    } catch (err) {
      alert("Upgrade failed – please refresh and try again");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
    >
      Upgrade to Pro
    </button>
  );
}
