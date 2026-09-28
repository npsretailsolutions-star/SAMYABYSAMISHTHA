"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, closeCart } = useCart();

  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto section-y text-center">
        <ShoppingBag size={48} className="mx-auto text-brand-teal/30 mb-4" />
        <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-2">
          Your bag is empty
        </h1>
        <p className="text-brand-teal/60 mb-6">
          Looks like you haven&apos;t added anything to your bag yet.
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
        Your Bag
      </h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-brand-teal/5">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif font-medium text-brand-teal hover:text-brand-gold-dark"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    className="p-1 text-brand-teal/50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 rounded-full border border-brand-teal/20 px-3 py-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="text-brand-teal disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="text-brand-teal disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="font-semibold text-brand-teal">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card h-fit sticky top-24">
          <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">
            Order Summary
          </h2>
          <div className="flex items-center justify-between text-sm text-brand-teal/70 mb-2">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-brand-teal/70 mb-4">
            <span>Shipping</span>
            <span className="text-emerald-700 font-medium">Free</span>
          </div>
          <div className="flex items-center justify-between border-t border-brand-teal/10 pt-4 text-base font-semibold text-brand-teal mb-6">
            <span>Total</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-gold w-full">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="btn-outline w-full mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
