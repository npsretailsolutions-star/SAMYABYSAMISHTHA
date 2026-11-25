"use client";

import { formatINR } from "@/lib/format";
import { useOffers } from "@/components/OffersProvider";

/**
 * "Add ₹X more to unlock 20% off" bar for cart/drawer, driven by the running automatic % offers
 * (Admin → Coupons → Automatic Offers). Hidden when no higher % tier is available.
 */
export default function OfferProgress({ subtotal }: { subtotal: number }) {
  const { offers, welcomeEligible } = useOffers();
  const tiers = offers.filter(
    (o) => o.kind === "PERCENT" && o.percent > 0 && (!o.requiresSubscriber || welcomeEligible)
  );
  if (tiers.length === 0 || subtotal <= 0) return null;

  const current = tiers
    .filter((o) => subtotal >= o.minSubtotal)
    .reduce((best, o) => Math.max(best, o.percent), 0);
  const next = tiers
    .filter((o) => o.minSubtotal > subtotal && o.percent > current)
    .sort((a, b) => a.minSubtotal - b.minSubtotal)[0];

  if (!next) {
    if (current === 0) return null;
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        🎉 You&apos;ve unlocked {current}% off on this order!
      </div>
    );
  }

  const remaining = next.minSubtotal - subtotal;
  const progress = Math.min(100, Math.round((subtotal / next.minSubtotal) * 100));
  return (
    <div className="rounded-xl bg-brand-gold/10 px-4 py-3">
      <p className="text-sm text-brand-teal">
        Add <span className="font-semibold">{formatINR(remaining)}</span> more to unlock{" "}
        <span className="font-semibold text-brand-gold-dark">{next.percent}% off</span> 🎉
        {current > 0 && <span className="text-brand-teal/60"> (now {current}% off)</span>}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-brand-gold transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
