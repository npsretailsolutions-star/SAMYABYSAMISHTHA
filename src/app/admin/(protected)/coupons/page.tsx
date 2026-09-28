import { prisma } from "@/lib/prisma";
import CouponManager from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Coupons & Discounts</h1>
      <CouponManager
        coupons={coupons.map((c) => ({
          ...c,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
