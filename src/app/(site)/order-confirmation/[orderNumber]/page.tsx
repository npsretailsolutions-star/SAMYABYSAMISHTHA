import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="container-px mx-auto section-y max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle2 size={52} className="mx-auto text-emerald-600 mb-4" />
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
          Thank you, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-brand-teal/70">
          Your order has been placed successfully.
        </p>
        <p className="mt-1 text-sm text-brand-teal/60">
          Order Number: <span className="font-semibold text-brand-teal">{order.orderNumber}</span>
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">
          Order Details
        </h2>
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-teal">
                {item.name} × {item.quantity}
                {item.giftNote && (
                  <span className="block text-xs text-brand-gold-dark">🎁 {item.giftNote}</span>
                )}
              </span>
              <span className="font-medium text-brand-teal">
                {formatINR(item.price * item.quantity + item.giftCharge)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-brand-teal/10 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-brand-teal/70">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          {order.codCharge > 0 && (
            <div className="flex justify-between text-brand-teal/70">
              <span>COD Charges</span>
              <span>+{formatINR(order.codCharge)}</span>
            </div>
          )}
          {order.giftTotal > 0 && (
            <div className="flex justify-between text-brand-teal/70">
              <span>Gift Wrapping</span>
              <span>+{formatINR(order.giftTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-brand-teal border-t border-brand-teal/10 pt-2">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mt-4">
        <h2 className="font-serif text-lg font-semibold text-brand-teal mb-3">
          Shipping To
        </h2>
        <p className="text-sm text-brand-teal/70 leading-relaxed">
          {order.customerName}
          <br />
          {order.address}, {order.city}, {order.state} - {order.pincode}
          <br />
          {order.phone} · {order.email}
        </p>
      </div>

      <div className="text-center mt-8">
        <Link href="/shop" className="btn-gold">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
