"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { describeOffer, type OfferKind } from "@/lib/offers";

export type AdminOffer = {
  id: string;
  name: string;
  kind: OfferKind;
  label: string;
  isActive: boolean;
  percent: number;
  minSubtotal: number;
  requiresSubscriber: boolean;
  bundleSize: number;
  bundlePrice: number;
  matchType: "SKUS" | "CATEGORY";
  matchValue: string;
  showInPromoBar: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

const KIND_LABELS: Record<OfferKind, string> = {
  BUNDLE: "Buy any N at a flat price",
  PERCENT: "% off the cart (automatic)",
  PREPAID_PERCENT: "Extra % off on prepaid orders",
};

const inputCls =
  "w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold";

type FormState = {
  name: string;
  kind: OfferKind;
  label: string;
  percent: string;
  minSubtotal: string;
  requiresSubscriber: boolean;
  bundleSize: string;
  bundlePrice: string;
  matchType: "SKUS" | "CATEGORY";
  matchValue: string;
  showInPromoBar: boolean;
  startsAt: string;
  endsAt: string;
};

const EMPTY: FormState = {
  name: "",
  kind: "PERCENT",
  label: "",
  percent: "",
  minSubtotal: "",
  requiresSubscriber: false,
  bundleSize: "3",
  bundlePrice: "",
  matchType: "CATEGORY",
  matchValue: "",
  showInPromoBar: true,
  startsAt: "",
  endsAt: "",
};

function toForm(o: AdminOffer): FormState {
  return {
    name: o.name,
    kind: o.kind,
    label: o.label,
    percent: o.percent ? String(o.percent) : "",
    minSubtotal: o.minSubtotal ? String(o.minSubtotal / 100) : "",
    requiresSubscriber: o.requiresSubscriber,
    bundleSize: String(o.bundleSize),
    bundlePrice: o.bundlePrice ? String(o.bundlePrice / 100) : "",
    matchType: o.matchType,
    matchValue: o.matchValue,
    showInPromoBar: o.showInPromoBar,
    startsAt: o.startsAt ? o.startsAt.slice(0, 10) : "",
    endsAt: o.endsAt ? o.endsAt.slice(0, 10) : "",
  };
}

export default function OfferManager({ offers }: { offers: AdminOffer[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const isBundle = form.kind === "BUNDLE";
    const payload = {
      name: form.name,
      kind: form.kind,
      label: form.label,
      percent: isBundle ? 0 : Number(form.percent) || 0,
      minSubtotal: form.minSubtotal ? Math.round(Number(form.minSubtotal) * 100) : 0,
      requiresSubscriber: form.kind === "PERCENT" ? form.requiresSubscriber : false,
      bundleSize: isBundle ? Number(form.bundleSize) || 3 : 3,
      bundlePrice: isBundle ? Math.round(Number(form.bundlePrice) * 100) || 0 : 0,
      matchType: form.matchType,
      matchValue: isBundle ? form.matchValue : "",
      showInPromoBar: form.showInPromoBar,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };
    const res = await fetch(editingId ? `/api/admin/offers/${editingId}` : "/api/admin/offers", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save the offer.");
      return;
    }
    reset();
    router.refresh();
  };

  const toggleActive = async (o: AdminOffer) => {
    await fetch(`/api/admin/offers/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !o.isActive }),
    });
    router.refresh();
  };

  const onDelete = async (o: AdminOffer) => {
    if (!confirm(`Delete the offer "${o.name}"?`)) return;
    await fetch(`/api/admin/offers/${o.id}`, { method: "DELETE" });
    if (editingId === o.id) reset();
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        {offers.map((o) => {
          const now = new Date();
          const scheduled = o.startsAt && new Date(o.startsAt) > now;
          const ended = o.endsAt && new Date(o.endsAt) < now;
          return (
            <div key={o.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-teal">{o.name}</p>
                  <p className="mt-0.5 text-sm text-brand-teal/70 break-words">{describeOffer(o)}</p>
                  <p className="mt-1 text-xs text-brand-teal/50">
                    Shown to customers as: &ldquo;{o.label}&rdquo;
                    {o.startsAt && ` · from ${new Date(o.startsAt).toLocaleDateString("en-IN")}`}
                    {o.endsAt && ` · until ${new Date(o.endsAt).toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(o)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      !o.isActive
                        ? "bg-gray-100 text-gray-600"
                        : ended
                          ? "bg-amber-100 text-amber-700"
                          : scheduled
                            ? "bg-sky-100 text-sky-700"
                            : "bg-emerald-100 text-emerald-700"
                    }`}
                    title="Click to switch on/off"
                  >
                    {!o.isActive ? "Off" : ended ? "Ended" : scheduled ? "Scheduled" : "Running"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(o.id);
                      setForm(toForm(o));
                      setError(null);
                    }}
                    className="p-2 text-brand-teal hover:text-brand-gold-dark"
                    aria-label="Edit offer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(o)}
                    className="p-2 text-brand-teal hover:text-red-600"
                    aria-label="Delete offer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {offers.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-brand-teal/60 shadow-card">
            No automatic offers. Customers get no discount unless they use a coupon code.
          </p>
        )}
      </div>

      <form onSubmit={onSave} className="rounded-2xl bg-white p-6 shadow-card space-y-4 h-fit">
        <h2 className="font-serif text-base font-semibold text-brand-teal">
          {editingId ? "Edit Offer" : "Add Automatic Offer"}
        </h2>
        <p className="text-xs text-brand-teal/60 -mt-2">
          Applies on the website by itself — customers don&apos;t enter any code.
        </p>

        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Offer type</label>
          <select
            value={form.kind}
            onChange={(e) => set("kind", e.target.value as OfferKind)}
            className={inputCls}
          >
            {Object.entries(KIND_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Offer name (for you)</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Diwali 15% off"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Text shown to customers
          </label>
          <input
            required
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder={form.kind === "BUNDLE" ? "Buy any 3 Rings @ ₹499" : "15% Off on all orders"}
            className={inputCls}
          />
        </div>

        {form.kind === "BUNDLE" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-brand-teal mb-1">Buy any</label>
                <input
                  required
                  type="number"
                  min={2}
                  value={form.bundleSize}
                  onChange={(e) => set("bundleSize", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-teal mb-1">For ₹ (total)</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.bundlePrice}
                  onChange={(e) => set("bundlePrice", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-teal mb-1">Which products?</label>
              <select
                value={form.matchType}
                onChange={(e) => set("matchType", e.target.value as "SKUS" | "CATEGORY")}
                className={inputCls}
              >
                <option value="CATEGORY">Whole category (by name)</option>
                <option value="SKUS">Specific products (by SKU)</option>
              </select>
              <textarea
                required
                rows={3}
                value={form.matchValue}
                onChange={(e) => set("matchValue", e.target.value)}
                placeholder={
                  form.matchType === "SKUS"
                    ? "KR-172, KR-173, KR-174"
                    : "earring  (any category whose name contains this word)"
                }
                className={`${inputCls} mt-2`}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-brand-teal mb-1">Discount (%)</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={100}
                  value={form.percent}
                  onChange={(e) => set("percent", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-teal mb-1">
                  Min cart ₹ (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minSubtotal}
                  onChange={(e) => set("minSubtotal", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            {form.kind === "PERCENT" && (
              <label className="flex items-center gap-2 text-sm text-brand-teal">
                <input
                  type="checkbox"
                  checked={form.requiresSubscriber}
                  onChange={(e) => set("requiresSubscriber", e.target.checked)}
                />
                Only for customers who gave their email
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-brand-teal">
              <input
                type="checkbox"
                checked={form.showInPromoBar}
                onChange={(e) => set("showInPromoBar", e.target.checked)}
              />
              Show in the top announcement bar
            </label>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Starts (optional)</label>
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Ends (optional)</label>
            <input
              type="date"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-gold flex-1 !py-2.5">
            <Plus size={15} /> {saving ? "Saving..." : editingId ? "Save Changes" : "Add Offer"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-outline !py-2.5 !px-4 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
