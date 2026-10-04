"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

// Metro/Tier-1 pincode prefixes get a faster estimate; everything else gets the standard window.
// This is a heuristic (no live courier API integration) but gives customers a useful estimate.
const FAST_PREFIXES = [
  "11", // Delhi NCR
  "40", // Mumbai
  "41", // Pune
  "56", // Bengaluru
  "60", // Chennai
  "70", // Kolkata
  "50", // Hyderabad
  "38", // Ahmedabad
];

function estimateDeliveryDays(pincode: string) {
  const prefix = pincode.slice(0, 2);
  const isFast = FAST_PREFIXES.includes(prefix);
  return isFast ? { min: 3, max: 5 } : { min: 5, max: 8 };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function DeliveryEstimate() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ min: Date; max: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = () => {
    setError(null);
    setResult(null);
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    const { min, max } = estimateDeliveryDays(pincode);
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    setResult({ min: new Date(now + min * dayMs), max: new Date(now + max * dayMs) });
  };

  return (
    <div className="rounded-xl border border-brand-teal/15 p-4">
      <p className="mb-2 text-sm font-semibold text-brand-teal">Delivery Details</p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter your pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="flex-1 rounded-lg border border-brand-teal/20 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-lg bg-brand-teal-dark px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-cream"
        >
          Check
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {result && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Truck size={13} className="shrink-0" />
          Estimated delivery by {formatDate(result.min)} – {formatDate(result.max)}
        </p>
      )}
    </div>
  );
}
