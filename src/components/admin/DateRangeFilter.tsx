"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarRange } from "lucide-react";

type Preset = "all" | "today" | "3d" | "7d" | "month" | "custom";

const OPTIONS: { value: Preset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

// yyyy-mm-dd in the browser's local time
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function rangeFor(preset: Preset): { from: string; to: string } | null {
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };
  switch (preset) {
    case "today":
      return { from: fmt(today), to: fmt(today) };
    case "3d":
      return { from: fmt(daysAgo(2)), to: fmt(today) };
    case "7d":
      return { from: fmt(daysAgo(6)), to: fmt(today) };
    case "month":
      return { from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmt(today) };
    default:
      return null;
  }
}

function detectPreset(from: string, to: string): Preset {
  if (!from && !to) return "all";
  for (const p of ["today", "3d", "7d", "month"] as Preset[]) {
    const r = rangeFor(p)!;
    if (r.from === from && r.to === to) return p;
  }
  return "custom";
}

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";

  const [preset, setPreset] = useState<Preset>(() => detectPreset(urlFrom, urlTo));
  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);

  const go = (f: string, t: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (f) params.set("from", f);
    else params.delete("from");
    if (t) params.set("to", t);
    else params.delete("to");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onPreset = (value: Preset) => {
    setPreset(value);
    if (value === "custom") return;
    const r = rangeFor(value);
    setFrom(r?.from || "");
    setTo(r?.to || "");
    go(r?.from || "", r?.to || "");
  };

  const inputCls =
    "rounded-lg border border-brand-teal/20 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card mb-6">
      <CalendarRange size={18} className="mb-2 text-brand-gold-dark shrink-0" />
      <div>
        <label className="block text-[11px] font-medium text-brand-teal/60 mb-1">Date</label>
        <select value={preset} onChange={(e) => onPreset(e.target.value as Preset)} className={inputCls}>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {preset === "custom" && (
        <>
          <div>
            <label className="block text-[11px] font-medium text-brand-teal/60 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-brand-teal/60 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </div>
          <button type="button" onClick={() => go(from, to)} className="btn-gold !py-1.5 !px-4 text-xs">
            Apply
          </button>
        </>
      )}
    </div>
  );
}
