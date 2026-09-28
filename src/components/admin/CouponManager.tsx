"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

export default function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: Number(value) * (type === "FLAT" ? 100 : 1),
        minOrderValue: minOrderValue ? Number(minOrderValue) * 100 : 0,
        expiresAt: expiresAt || null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not create coupon.");
      return;
    }
    setCode("");
    setValue("");
    setMinOrderValue("");
    setExpiresAt("");
    setUsageLimit("");
    router.refresh();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Min Order</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-brand-teal/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-brand-teal">{c.code}</td>
                <td className="px-4 py-3 text-brand-teal/70">
                  {c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)}
                </td>
                <td className="px-4 py-3 text-brand-teal/70">
                  {c.minOrderValue > 0 ? formatINR(c.minOrderValue) : "—"}
                </td>
                <td className="px-4 py-3 text-brand-teal/70">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-brand-teal/70">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-2 text-brand-teal hover:text-red-600"
                    aria-label="Delete coupon"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No coupons yet.</p>
        )}
      </div>

      <form onSubmit={onAdd} className="rounded-2xl bg-white p-6 shadow-card space-y-4 h-fit">
        <h2 className="font-serif text-base font-semibold text-brand-teal">Create Coupon</h2>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="DIWALI25"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "PERCENT" | "FLAT")}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="PERCENT">% Off</option>
              <option value="FLAT">₹ Off</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">
              Value {type === "PERCENT" ? "(%)" : "(₹)"}
            </label>
            <input
              required
              type="number"
              min={1}
              max={type === "PERCENT" ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Minimum Order Value (₹, optional)
          </label>
          <input
            type="number"
            min={0}
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">
              Expires (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">
              Usage Limit (optional)
            </label>
            <input
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-gold w-full !py-2.5">
          <Plus size={15} /> {saving ? "Creating..." : "Create Coupon"}
        </button>
      </form>
    </div>
  );
}
