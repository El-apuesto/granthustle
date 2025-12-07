// src/components/UpgradeButton.tsx
"use client";

export default function UpgradeButton() {
  const handleClick = async () => {
    const res = await fetch("/api/create-checkout-session", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.assign(url); // why: prevents "Stripe is not defined"
  };

  return (
    <button
      onClick={handleClick}
      className="mx-auto mt-8 w-80 max-w-full rounded-xl bg-emerald-600 px-8 py-5 text-center font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
    >
      <div className="text-3xl">Try Pro 64% off</div>
      <div className="text-sm opacity-90 mt-1">
        or click to see all plans and prices
      </div>
    </button>
  );
}
