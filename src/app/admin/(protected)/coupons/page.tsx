import { prisma } from "@/lib/prisma";
import CouponManager from "@/components/admin/CouponManager";
import OfferManager from "@/components/admin/OfferManager";
import { getActiveOffers } from "@/lib/offersServer";
import type { OfferKind } from "@/lib/offers";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await getActiveOffers(); // makes sure the default offers exist the first time
  const [coupons, offers] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.offer.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-1">Automatic Offers</h1>
        <p className="mb-5 text-sm text-brand-teal/60">
          These apply on the website by themselves — no coupon code needed. Switch an offer off to
          stop it, or add a new one.
        </p>
        <OfferManager
          offers={offers.map((o) => ({
            id: o.id,
            name: o.name,
            kind: o.kind as OfferKind,
            label: o.label,
            isActive: o.isActive,
            percent: o.percent,
            minSubtotal: o.minSubtotal,
            requiresSubscriber: o.requiresSubscriber,
            bundleSize: o.bundleSize,
            bundlePrice: o.bundlePrice,
            matchType: o.matchType as "SKUS" | "CATEGORY",
            matchValue: o.matchValue,
            showInPromoBar: o.showInPromoBar,
            startsAt: o.startsAt ? o.startsAt.toISOString() : null,
            endsAt: o.endsAt ? o.endsAt.toISOString() : null,
          }))}
        />
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-brand-teal mb-1">Coupon Codes</h2>
        <p className="mb-5 text-sm text-brand-teal/60">
          Customers type these codes at checkout.
        </p>
        <CouponManager
          coupons={coupons.map((c) => ({
            ...c,
            expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
          }))}
        />
      </section>
    </div>
  );
}
