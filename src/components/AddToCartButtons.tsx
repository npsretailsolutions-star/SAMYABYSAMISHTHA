"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import GiftOptions from "@/components/GiftOptions";
import type { GiftWrapSelection } from "@/lib/types";

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
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [giftWrap, setGiftWrap] = useState<GiftWrapSelection | null>(null);
  const [giftCharge, setGiftCharge] = useState(0);

  useEffect(() => {
    setQty(1);
  }, [variantId]);

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

      <div className="flex flex-col sm:flex-row gap-3">
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
    </div>
  );
}
