import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import TrackVisit from "@/components/TrackVisit";
import WelcomePopup from "@/components/WelcomePopup";
import MetaPixel from "@/components/MetaPixel";
import TawkToWidget from "@/components/TawkToWidget";
import { OffersProvider } from "@/components/OffersProvider";
import { getActiveOffers } from "@/lib/offersServer";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });

  const offers = await getActiveOffers();

  return (
    <OffersProvider offers={offers}>
      <MetaPixel />
      <TrackVisit />
      <WelcomePopup />
      <PromoBar offers={offers} />
      <Header categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} />
      <TawkToWidget />
    </OffersProvider>
  );
}
