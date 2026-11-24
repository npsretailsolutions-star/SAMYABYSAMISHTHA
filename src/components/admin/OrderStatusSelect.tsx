"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, statusLabel } from "@/lib/orderStatus";

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(status);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const onChange = async (value: string) => {
    setCurrent(value);
    setNote(null);
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    if (!res.ok) {
      setNote({ ok: false, text: "Could not update status" });
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.shippedEmailSent === true)
      setNote({ ok: true, text: "Shipping email sent to customer" });
    else if (data.shippedEmailSent === false)
      setNote({ ok: false, text: "Shipping email could not be sent" });
    else if (data.deliveredEmailSent === true)
      setNote({ ok: true, text: "Delivered email sent to customer" });
    else if (data.deliveredEmailSent === false)
      setNote({ ok: false, text: "Delivered email could not be sent" });
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={current}
        disabled={saving}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-brand-teal/20 bg-white px-4 py-2 text-sm text-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
      {note && (
        <span
          className={`text-xs ${note.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {note.text}
        </span>
      )}
    </div>
  );
}
