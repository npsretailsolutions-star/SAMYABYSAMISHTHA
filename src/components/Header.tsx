"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, Heart, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Necklaces", href: "/shop/necklaces" },
  { label: "Earrings", href: "/shop/earrings" },
  { label: "Bangles", href: "/shop/bangles" },
  { label: "Bracelets", href: "/shop/bracelets" },
  { label: "Pendants", href: "/shop/pendants" },
  { label: "Gifting", href: "/shop/gifting" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-teal/10 bg-brand-cream/95 backdrop-blur">
        <div className="container-px mx-auto flex h-16 sm:h-20 items-center justify-between">
          <button
            className="lg:hidden p-2 -ml-2 text-brand-teal"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt="Samya By Samishtha"
              width={180}
              height={72}
              className="h-14 sm:h-16 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide text-brand-teal hover:text-brand-gold-dark transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-brand-teal hover:text-brand-gold-dark"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>
            <Link
              href="/wishlist"
              className="relative p-2 text-brand-teal hover:text-brand-gold-dark"
              aria-label="Open wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-teal-dark">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-brand-teal hover:text-brand-gold-dark"
              aria-label="Open cart"
            >
              <ShoppingBag size={22} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-teal-dark">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-brand-cream shadow-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <Image
                src="/images/logo.svg"
                alt="Samya By Samishtha"
                width={150}
                height={60}
                className="h-12 w-auto object-contain"
              />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1 text-brand-teal"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-base font-medium uppercase tracking-wide text-brand-teal border-b border-brand-teal/10"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base font-medium uppercase tracking-wide text-brand-gold-dark"
              >
                Shop All
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base font-medium uppercase tracking-wide text-brand-teal"
              >
                Wishlist
              </Link>
            </nav>
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <CartDrawer />
    </>
  );
}
