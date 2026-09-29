import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = "https://www.samyabysamishtha.com";
const TITLE = "Samya By Samishtha | Premium Artificial & Fashion Jewellery";
const DESCRIPTION =
  "Shop premium artificial & fashion jewellery online — earrings, necklaces, bangles, pendants and gifting sets, handcrafted for everyday elegance and festive celebration. Free shipping across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Samya By Samishtha" },
  description: DESCRIPTION,
  keywords: [
    "artificial jewellery",
    "fashion jewellery online",
    "imitation jewellery india",
    "kundan jewellery",
    "gold plated earrings",
    "necklace set online",
    "jewellery gifting",
  ],
  icons: { icon: "/images/logo.png" },
  openGraph: {
    type: "website",
    siteName: "Samya By Samishtha",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/images/hero-banner.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-brand-cream text-brand-teal-dark`}
      >
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
