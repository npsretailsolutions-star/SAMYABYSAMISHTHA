"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, closeCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    couponCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discount = form.couponCode.trim().toUpperCase() === "RK20" ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal - discount;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.order.orderNumber}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto section-y text-center">
        <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-3">
          Your bag is empty
        </h1>
        <Link href="/shop" className="btn-gold">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto section-y">
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-teal mb-8">
        Checkout
      </h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
            <h2 className="font-serif text-lg font-semibold text-brand-teal">
              Shipping Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" name="customerName" value={form.customerName} onChange={onChange} required />
              <Field label="Phone" name="phone" value={form.phone} onChange={onChange} required type="tel" />
            </div>
            <Field label="Email" name="email" value={form.email} onChange={onChange} required type="email" />
            <Field label="Address" name="address" value={form.address} onChange={onChange} required />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" name="city" value={form.city} onChange={onChange} required />
              <Field label="State" name="state" value={form.state} onChange={onChange} required />
              <Field label="Pincode" name="pincode" value={form.pincode} onChange={onChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-teal mb-1">
                Order Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-brand-teal mb-3">
              Payment Method
            </h2>
            <div className="flex items-center gap-3 rounded-xl border border-brand-gold/40 bg-brand-gold/5 px-4 py-3">
              <input type="radio" checked readOnly className="accent-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-teal">Cash on Delivery</p>
                <p className="text-xs text-brand-teal/60">
                  Pay when your order arrives at your doorstep.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? "Placing Order..." : `Place Order · ${formatINR(total)}`}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-card h-fit sticky top-24">
          <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-teal/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm text-brand-teal line-clamp-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-brand-teal whitespace-nowrap ml-2">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Coupon code"
              name="couponCode"
              value={form.couponCode}
              onChange={onChange}
              className="flex-1 rounded-full border border-brand-teal/20 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div className="space-y-2 border-t border-brand-teal/10 pt-4 text-sm">
            <div className="flex items-center justify-between text-brand-teal/70">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Discount (RK20)</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-brand-teal/70">
              <span>Shipping</span>
              <span className="text-emerald-700 font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-brand-teal/10 pt-3 text-base font-semibold text-brand-teal">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-teal mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
    </div>
  );
}
