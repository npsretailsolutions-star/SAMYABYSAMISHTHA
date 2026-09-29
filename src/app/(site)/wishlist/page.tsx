"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto section-y text-center">
        <Heart size={48} className="mx-auto text-brand-teal/30 mb-4" />
        <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-2">
          Your wishlist is empty
        </h1>
        <p className="text-brand-teal/60 mb-6">
          Save the pieces you love and come back to them anytime.
        </p>
        <Link href="/shop" className="btn-gold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto section-y">
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-teal mb-8">
        Your Wishlist
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card"
          >
            <Link href={`/product/${item.slug}`} className="relative block aspect-square overflow-hidden bg-brand-teal/5">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </Link>
            <button
              onClick={() => removeItem(item.productId)}
              aria-label="Remove from wishlist"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-teal/70 shadow-sm transition-colors hover:bg-white hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <Link href={`/product/${item.slug}`}>
                <h3 className="font-serif text-sm sm:text-base font-medium text-brand-teal line-clamp-2 min-h-[2.5em] hover:text-brand-gold-dark">
                  {item.name}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm sm:text-base font-semibold text-brand-teal">
                  {formatINR(item.price)}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.price && (
                  <span className="text-xs text-brand-teal/50 line-through">
                    {formatINR(item.compareAtPrice)}
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  item.stock > 0 &&
                  addItem({
                    productId: item.productId,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                    stock: item.stock,
                  })
                }
                disabled={item.stock <= 0}
                className="mt-3 flex items-center justify-center gap-2 rounded-full border border-brand-teal py-2 text-xs font-semibold uppercase tracking-wide text-brand-teal transition-colors hover:bg-brand-teal hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag size={14} />
                {item.stock > 0 ? "Add to Bag" : "Sold Out"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
