import { RotateCcw, ShieldCheck, Truck, Flag, Gem } from "lucide-react";
import DeliveryEstimate from "@/components/DeliveryEstimate";

const BADGES = [
  { icon: RotateCcw, label: "5 Days Return" },
  { icon: ShieldCheck, label: "Skin Friendly" },
  { icon: Truck, label: "Free Shipping" },
  { icon: Flag, label: "Made In India" },
  { icon: Gem, label: "Premium Quality" },
];

export default function ProductTrustBadges() {
  return (
    <div className="mt-8 space-y-5 border-t border-brand-teal/10 pt-6">
      <DeliveryEstimate />
      <div className="grid grid-cols-3 gap-4">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
            <Icon size={20} className="text-brand-gold-dark" />
            <span className="text-[11px] leading-tight text-brand-teal/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
