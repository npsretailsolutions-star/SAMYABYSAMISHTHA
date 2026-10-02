import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import TrackVisit from "@/components/TrackVisit";
import WelcomePopup from "@/components/WelcomePopup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackVisit />
      <WelcomePopup />
      <PromoBar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
