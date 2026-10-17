"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["Delhivery", "Bluedart", "DTDC", "Xpressbees", "Ecom Express", "Shadowfax", "India Post"];

export default function CourierPartnerInput({ orderId, value }: { orderId: string; value: string }) {
  const router = useRouter();
  const [courier, setCourier] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courierPartner: courier }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        list="courier-suggestions"
        value={courier}
        onChange={(e) => {
          setCourier(e.target.value);
          setSaved(false);
        }}
        placeholder="e.g. Delhivery"
        maxLength={80}
        className="rounded-lg border border-brand-teal/20 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
      <datalist id="courier-suggestions">
        {SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <button type="button" onClick={save} disabled={saving} className="btn-gold !py-1.5 !px-4 text-xs disabled:opacity-50">
        {saving ? "Saving..." : "Save"}
      </button>
      {saved && <span className="text-xs text-emerald-600">Saved</span>}
    </div>
  );
}
