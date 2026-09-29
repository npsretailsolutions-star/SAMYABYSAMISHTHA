"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/components/WishlistProvider";

type WishlistButtonProps = {
  item: WishlistItem;
  variant?: "overlay" | "inline";
  size?: number;
};

export default function WishlistButton({
  item,
  variant = "overlay",
  size = 18,
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(item.productId);

  if (variant === "inline") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(item);
        }}
        className={`flex items-center justify-center gap-2 rounded-full border py-2 px-4 text-xs font-semibold uppercase tracking-wide transition-colors ${
          active
            ? "border-brand-gold bg-brand-gold/10 text-brand-gold-dark"
            : "border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-brand-cream"
        }`}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={14} className={active ? "fill-current" : ""} />
        {active ? "Wishlisted" : "Wishlist"}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(item);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-teal shadow-sm transition-colors hover:bg-white"
    >
      <Heart
        size={size}
        className={active ? "fill-brand-gold text-brand-gold" : ""}
      />
    </button>
  );
}
