"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarRange, X } from "lucide-react";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clear = () => {
    setFrom("");
    setTo("");
    router.push(pathname);
  };

  const hasFilter = Boolean(searchParams.get("from") || searchParams.get("to"));

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card mb-6">
      <CalendarRange size={18} className="mb-2 text-brand-gold-dark shrink-0" />
      <div>
        <label className="block text-[11px] font-medium text-brand-teal/60 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-brand-teal/20 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-brand-teal/60 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-brand-teal/20 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>
      <button type="button" onClick={apply} className="btn-gold !py-1.5 !px-4 text-xs">
        Apply
      </button>
      {hasFilter && (
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 text-xs font-medium text-brand-teal/60 hover:text-red-600"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
