"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import GiftOptions from "@/components/GiftOptions";
import type { GiftWrapSelection } from "@/lib/types";
import { formatINR } from "@/lib/format";

export default function AddToCartButtons({
  productId,
  variantId,
  variantLabel,
  name,
  slug,
  price,
  image,
  stock,
  categorySlug,
  categoryName,
  sku,
}: {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  categorySlug?: string;
  categoryName?: string;
  sku?: string | null;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [giftWrap, setGiftWrap] = useState<GiftWrapSelection | null>(null);
  const [giftCharge, setGiftCharge] = useState(0);

  useEffect(() => {
    setQty(1);
  }, [variantId]);

  // Mobile: once the main buttons scroll out of view, show a bar fixed to the bottom of the screen.
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = buttonsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => {
      // Only when the buttons are above the screen (user scrolled past them), not before reaching them.
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const item = {
    productId,
    variantId,
    variantLabel,
    name,
    slug,
    price,
    image,
    stock,
    giftWrap: giftWrap || undefined,
    giftCharge: giftCharge || undefined,
    isGiftItem: categorySlug === "gifting" || undefined,
    categorySlug,
    categoryName,
    sku,
  };

  return (
    <div className="space-y-4">
      <GiftOptions
        onChange={(selection, charge) => {
          setGiftWrap(selection);
          setGiftCharge(charge);
        }}
      />

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-brand-teal">Quantity</span>
        <div className="flex items-center gap-3 rounded-full border border-brand-teal/20 px-3 py-1.5">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="text-brand-teal disabled:opacity-30"
          >
            <Minus size={15} />
          </button>
          <span className="w-6 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={qty >= stock}
            aria-label="Increase quantity"
            className="text-brand-teal disabled:opacity-30"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => addItem(item, qty)}
          disabled={stock <= 0}
          className="btn-outline flex-1"
        >
          <ShoppingBag size={16} />
          Add to Bag
        </button>
        <button
          onClick={() => {
            addItem(item, qty);
            router.push("/checkout");
          }}
          disabled={stock <= 0}
          className="btn-gold flex-1"
        >
          <Zap size={16} />
          Buy Now
        </button>
      </div>

      {showSticky && stock > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-teal/10 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-brand-teal/70">{variantLabel || name}</p>
              <p className="text-base font-semibold text-brand-teal">{formatINR(price)}</p>
            </div>
            <button onClick={() => addItem(item, qty)} className="btn-outline !px-4 !py-2.5 text-xs">
              <ShoppingBag size={14} />
              Add
            </button>
            <button
              onClick={() => {
                addItem(item, qty);
                router.push("/checkout");
              }}
              className="btn-gold !px-4 !py-2.5 text-xs"
            >
              <Zap size={14} />
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
