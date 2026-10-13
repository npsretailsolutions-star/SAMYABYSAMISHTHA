import { prisma } from "@/lib/prisma";
import BannerManager from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.heroBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Hero Banners</h1>
      <BannerManager banners={banners} />
    </div>
  );
}
