import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

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

export const metadata: Metadata = {
  title: "Samya By Samishtha | Premium Artificial & Fashion Jewellery",
  description:
    "Shop premium artificial & fashion jewellery — earrings, necklaces, bangles, pendants and gifting sets from Samya By Samishtha.",
  icons: { icon: "/images/logo.png" },
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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
