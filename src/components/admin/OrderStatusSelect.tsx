"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

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

  const onChange = async (value: string) => {
    setCurrent(value);
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  };

  return (
    <select
      value={current}
      disabled={saving}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-brand-teal/20 bg-white px-4 py-2 text-sm text-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
