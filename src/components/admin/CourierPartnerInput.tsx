"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["Delhivery", "Bluedart", "DTDC", "Xpressbees", "Ecom Express", "Shadowfax", "India Post"];

const inputCls =
  "rounded-lg border border-brand-teal/20 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold";

export default function CourierPartnerInput({
  orderId,
  value,
  tracking,
}: {
  orderId: string;
  value: string;
  tracking: string;
}) {
  const router = useRouter();
  const [courier, setCourier] = useState(value);
  const [trackingId, setTrackingId] = useState(tracking);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courierPartner: courier, trackingNumber: trackingId }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-brand-teal/60">
          Courier Partner
          <input
            list="courier-suggestions"
            value={courier}
            onChange={(e) => {
              setCourier(e.target.value);
              setSaved(false);
            }}
            placeholder="e.g. Shadowfax"
            maxLength={80}
            className={`${inputCls} mt-1 block`}
          />
        </label>
        <datalist id="courier-suggestions">
          {SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <label className="text-xs text-brand-teal/60">
          Tracking ID
          <input
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              setSaved(false);
            }}
            placeholder="e.g. SF123456789"
            maxLength={80}
            className={`${inputCls} mt-1 block`}
          />
        </label>
        <button type="button" onClick={save} disabled={saving} className="btn-gold !py-1.5 !px-4 text-xs disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
      <p className="mt-2 text-xs text-brand-teal/50">
        Save courier &amp; tracking ID first, then change status to SHIPPED — the customer gets a shipping email with
        these details.
      </p>
    </div>
  );
}
