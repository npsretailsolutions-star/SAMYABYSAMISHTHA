"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";
import {
  AUTO_DISCOUNT_PERCENT,
  AUTO_DISCOUNT_LABEL,
  PREPAID_DISCOUNT_PERCENT,
  COD_CHARGE,
} from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const autoDiscount = Math.round((subtotal * AUTO_DISCOUNT_PERCENT) / 100);
  const baseDiscount = Math.max(appliedCoupon?.discount ?? 0, autoDiscount);
  const discountLabel =
    appliedCoupon && appliedCoupon.discount > autoDiscount
      ? `${appliedCoupon.code} applied`
      : AUTO_DISCOUNT_LABEL;
  const prepaidDiscount =
    paymentMethod === "RAZORPAY" ? Math.round((subtotal * PREPAID_DISCOUNT_PERCENT) / 100) : 0;
  const codCharge = paymentMethod === "COD" ? COD_CHARGE : 0;
  const discount = baseDiscount + prepaidDiscount;
  const total = subtotal - discount + codCharge;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
        setApplying(false);
        return;
      }
      setAppliedCoupon({ code: data.code, discount: data.discount });
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    }
    setApplying(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const cartItems = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    variantId: i.variantId || undefined,
  }));

  const payWithCOD = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        couponCode: appliedCoupon?.code,
        items: cartItems,
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
  };

  const payWithRazorpay = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Could not load payment gateway. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    const createRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponCode: appliedCoupon?.code, items: cartItems }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setError(createData.error || "Could not initiate payment.");
      setSubmitting(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: createData.keyId,
      amount: createData.amount,
      currency: createData.currency,
      order_id: createData.razorpayOrderId,
      name: "Samya By Samishtha",
      description: "Order Payment",
      image: "/images/logo.svg",
      prefill: {
        name: form.customerName,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#0b3d3a" },
      handler: async (response: unknown) => {
        const r = response as {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...r,
            ...form,
            couponCode: appliedCoupon?.code,
            items: cartItems,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          setError(verifyData.error || "Payment verification failed. Please contact support.");
          setSubmitting(false);
          return;
        }
        clearCart();
        router.push(`/order-confirmation/${verifyData.order.orderNumber}`);
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
        },
      },
    });

    razorpay.on("payment.failed", () => {
      setError("Payment failed. Please try again or choose Cash on Delivery.");
      setSubmitting(false);
    });

    razorpay.open();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      if (paymentMethod === "COD") {
        await payWithCOD();
      } else {
        await payWithRazorpay();
      }
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

          <div className="rounded-2xl bg-white p-6 shadow-card space-y-3">
            <h2 className="font-serif text-lg font-semibold text-brand-teal mb-1">
              Payment Method
            </h2>
            <label
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                paymentMethod === "RAZORPAY"
                  ? "border-brand-gold/60 bg-brand-gold/5"
                  : "border-brand-teal/15"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
                className="accent-brand-gold"
              />
              <div>
                <p className="text-sm font-medium text-brand-teal">
                  Pay Online — Cards, UPI, Netbanking
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Extra {PREPAID_DISCOUNT_PERCENT}% off — secure payment powered by Razorpay.
                </p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                paymentMethod === "COD"
                  ? "border-brand-gold/60 bg-brand-gold/5"
                  : "border-brand-teal/15"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="accent-brand-gold"
              />
              <div>
                <p className="text-sm font-medium text-brand-teal">Cash on Delivery</p>
                <p className="text-xs text-brand-teal/60">
                  Pay when your order arrives at your doorstep. ₹{COD_CHARGE / 100} extra handling
                  charge applies.
                </p>
              </div>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting
              ? "Processing..."
              : paymentMethod === "RAZORPAY"
                ? `Pay ${formatINR(total)}`
                : `Place Order · ${formatINR(total)}`}
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

          <div className="mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm">
                <span className="font-medium text-emerald-700">
                  {appliedCoupon.code} applied
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-medium text-emerald-700 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 rounded-full border border-brand-teal/20 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applying}
                  className="btn-outline !py-2 !px-5 text-xs"
                >
                  {applying ? "..." : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
          </div>

          <div className="space-y-2 border-t border-brand-teal/10 pt-4 text-sm">
            <div className="flex items-center justify-between text-brand-teal/70">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {baseDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>{discountLabel}</span>
                <span>-{formatINR(baseDiscount)}</span>
              </div>
            )}
            {prepaidDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Prepaid Discount ({PREPAID_DISCOUNT_PERCENT}%)</span>
                <span>-{formatINR(prepaidDiscount)}</span>
              </div>
            )}
            {codCharge > 0 && (
              <div className="flex items-center justify-between text-brand-teal/70">
                <span>COD Charges</span>
                <span>+{formatINR(codCharge)}</span>
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
