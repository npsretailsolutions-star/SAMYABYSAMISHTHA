import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackVisit from "@/components/TrackVisit";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackVisit />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
