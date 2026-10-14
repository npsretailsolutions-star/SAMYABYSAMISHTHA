import { BadgePercent } from "lucide-react";
import type { OfferData } from "@/lib/offers";

// Shows the labels of the active offers flagged "show in top bar" (Admin → Coupons).
export default function PromoBar({ offers }: { offers: OfferData[] }) {
  const labels = offers.filter((o) => o.showInPromoBar).map((o) => o.label);
  if (labels.length === 0) return null;

  return (
    <div className="bg-brand-teal-dark text-brand-cream">
      <div className="container-px mx-auto flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide">
        {labels.map((label, i) => (
          <span key={i} className="flex items-center gap-2.5">
            {i > 0 && <span className="hidden sm:inline text-brand-cream/40">•</span>}
            <span className="flex items-center gap-1.5">
              {i === 0 && <BadgePercent size={14} className="text-brand-gold-light shrink-0" />}
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
