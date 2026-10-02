import { BadgePercent } from "lucide-react";

export default function PromoBar() {
  return (
    <div className="bg-brand-teal-dark text-brand-cream">
      <div className="container-px mx-auto flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <BadgePercent size={14} className="text-brand-gold-light shrink-0" />
          Extra 5% Off on Prepaid Orders
        </span>
        <span className="hidden sm:inline text-brand-cream/40">•</span>
        <span>COD Available (₹49 Extra)</span>
      </div>
    </div>
  );
}
