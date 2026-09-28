"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, subtotal } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-brand-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-teal/10 px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-brand-teal">
            Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="p-1 text-brand-teal">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={40} className="text-brand-teal/30" />
            <p className="text-brand-teal/70">Your bag is empty.</p>
            <button onClick={closeCart} className="btn-outline">
              <Link href="/shop">Continue Shopping</Link>
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 border-b border-brand-teal/10 pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-brand-teal line-clamp-2 hover:text-brand-gold-dark"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove item"
                        className="p-1 text-brand-teal/50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-brand-teal/20 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="text-brand-teal disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="text-brand-teal disabled:opacity-30"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-brand-teal">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-teal/10 px-5 py-5 space-y-4">
              <div className="flex items-center justify-between text-base font-semibold text-brand-teal">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-brand-teal/60">
                Shipping & taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-gold w-full"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-outline w-full"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
