"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  PackageCheck,
  PackageSearch,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { formatINR } from "@/lib/format";

const STEPS = [
  { key: "PENDING", label: "Order Placed", icon: PackageSearch },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "SHIPPED", label: "Shipped", icon: PackageCheck },
  { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string | null;
  city: string;
  state: string;
  total: number;
  createdAt: string;
  items: { name: string; variantLabel: string | null; quantity: number }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not find that order.");
      return;
    }
    setOrder(data.order);
  };

  const currentStepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="container-px mx-auto section-y max-w-xl">
      <div className="text-center mb-8">
        <span className="eyebrow">Order Status</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal">Track Your Order</h1>
        <p className="mt-2 text-sm text-brand-teal/60">
          Enter your order number and the phone number used at checkout.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-card space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Order Number</label>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="SBS2026001"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Phone Number</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Used at checkout"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
          <Search size={16} /> {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-brand-teal/50">Order Number</p>
              <p className="font-serif text-lg font-semibold text-brand-teal">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-teal/50">Total</p>
              <p className="font-semibold text-brand-teal">{formatINR(order.total)}</p>
            </div>
          </div>

          {order.status === "CANCELLED" ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 mb-6">
              <XCircle size={18} /> This order has been cancelled.
            </div>
          ) : (
            <div className="mb-6 space-y-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const reached = i <= currentStepIndex;
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {reached ? (
                        <Icon size={20} className="text-brand-gold-dark" />
                      ) : (
                        <Circle size={20} className="text-brand-teal/20" />
                      )}
                      {i < STEPS.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-[22px] ${
                            i < currentStepIndex ? "bg-brand-gold" : "bg-brand-teal/10"
                          }`}
                        />
                      )}
                    </div>
                    <p
                      className={`pb-5 text-sm ${
                        reached ? "font-medium text-brand-teal" : "text-brand-teal/40"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {order.trackingNumber && (
            <p className="text-xs text-brand-teal/60 mb-4">
              Courier Tracking Number: <span className="font-medium text-brand-teal">{order.trackingNumber}</span>
            </p>
          )}

          <div className="border-t border-brand-teal/10 pt-4">
            <p className="text-xs text-brand-teal/50 mb-2">Items</p>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <p key={i} className="text-sm text-brand-teal/80">
                  {item.name}
                  {item.variantLabel && (
                    <span className="text-brand-teal/50"> ({item.variantLabel})</span>
                  )}{" "}
                  × {item.quantity}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
