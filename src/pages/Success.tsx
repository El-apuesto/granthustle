// src/pages/Success.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-4xl text-white font-bold mb-4">Payment Successful 🎉</h1>
        <p className="text-slate-300 text-lg">Your subscription is active.</p>
        <p className="text-slate-400 mt-2">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
