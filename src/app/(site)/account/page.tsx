"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, LogOut } from "lucide-react";
import { useCustomer } from "@/components/CustomerProvider";
import { formatINR } from "@/lib/format";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number; image: string | null }[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/account/login?redirect=/account");
    }
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
      });
      fetch("/api/customer/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []));
    }
  }, [customer]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/customer/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const onLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !customer) {
    return <div className="container-px mx-auto section-y text-center text-brand-teal/60">Loading...</div>;
  }

  return (
    <div className="container-px mx-auto section-y">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="eyebrow">My Account</span>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
            Hi, {customer.name.split(" ")[0]}
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-teal/60 hover:text-red-600"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-card h-fit">
          <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">
            Profile & Default Address
          </h2>
          <p className="text-xs text-brand-teal/60 mb-4">
            Saved here, prefilled at checkout — you can still edit any field before placing an
            order.
          </p>
          <form onSubmit={onSave} className="space-y-4">
            <Field label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
              <Field label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
            </div>
            <Field label="Pincode" value={form.pincode} onChange={(v) => setForm((f) => ({ ...f, pincode: v }))} />
            <p className="text-xs text-brand-teal/50">Email: {customer.email}</p>
            <button type="submit" disabled={saving} className="btn-gold w-full !py-2.5 text-sm">
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">Order History</h2>
          {orders === null ? (
            <p className="text-sm text-brand-teal/60">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-card">
              <Package size={32} className="mx-auto text-brand-teal/30 mb-3" />
              <p className="text-sm text-brand-teal/60 mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="btn-gold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/order-confirmation/${o.orderNumber}`}
                  className="block rounded-2xl bg-white p-5 shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-medium text-brand-teal">{o.orderNumber}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[o.status] || ""}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-teal/60 mb-2">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} item(s) ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm font-semibold text-brand-teal">{formatINR(o.total)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-teal mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-teal/20 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
    </div>
  );
}
