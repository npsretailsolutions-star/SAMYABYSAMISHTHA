"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck } from "lucide-react";

export default function ShipOrderAction({
  orderId,
  trackingNumber,
  shippingStatus,
  shippingError,
}: {
  orderId: string;
  trackingNumber: string | null;
  shippingStatus: string | null;
  shippingError: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(shippingError);

  const ship = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/ship`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create shipment.");
    }
    setBusy(false);
    router.refresh();
  };

  if (trackingNumber && shippingStatus !== "Failed") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-3">Shipping</h2>
        <div className="flex items-center gap-2 text-sm">
          <Truck size={16} className="text-brand-gold-dark" />
          <span className="text-brand-teal/70">Delhivery Waybill:</span>
          <span className="font-semibold text-brand-teal">{trackingNumber}</span>
        </div>
        <a
          href={`https://www.delhivery.com/track-v2/package/${trackingNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-brand-gold-dark hover:underline"
        >
          Track on Delhivery →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="font-serif text-base font-semibold text-brand-teal mb-3">Shipping</h2>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>
      )}
      <button
        type="button"
        onClick={ship}
        disabled={busy}
        className="btn-outline flex items-center gap-2 disabled:opacity-50"
      >
        <Truck size={16} /> {busy ? "Creating shipment..." : "Ship via Delhivery"}
      </button>
    </div>
  );
}
