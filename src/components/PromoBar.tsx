import { BadgePercent } from "lucide-react";

export default function PromoBar() {
  return (
    <div className="bg-brand-teal-dark text-brand-cream">
      <div className="container-px mx-auto flex items-center justify-center gap-2 py-2 text-center text-[11px] sm:text-xs font-medium tracking-wide">
        <BadgePercent size={14} className="text-brand-gold-light shrink-0" />
        <span>10% OFF ON ALL ORDERS</span>
      </div>
    </div>
  );
}
