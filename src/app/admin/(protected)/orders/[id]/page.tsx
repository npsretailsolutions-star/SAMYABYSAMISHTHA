import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import ShipOrderAction from "@/components/admin/ShipOrderAction";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-teal">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-brand-teal/60">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-serif text-base font-semibold text-brand-teal mb-3">Customer</h2>
          <p className="text-sm text-brand-teal/70">{order.customerName}</p>
          <p className="text-sm text-brand-teal/70">{order.email}</p>
          <p className="text-sm text-brand-teal/70">{order.phone}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-serif text-base font-semibold text-brand-teal mb-3">Shipping Address</h2>
          <p className="text-sm text-brand-teal/70 leading-relaxed">
            {order.address}, {order.city}, {order.state} - {order.pincode}
          </p>
          {order.notes && (
            <p className="text-sm text-brand-teal/60 mt-2 italic">Note: {order.notes}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <ShipOrderAction
          orderId={order.id}
          trackingNumber={order.trackingNumber}
          shippingStatus={order.shippingStatus}
          shippingError={order.shippingError}
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mb-6">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-3">Payment</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-brand-teal/70">
            Method: <span className="font-medium text-brand-teal">{order.paymentMethod}</span>
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              order.paymentStatus === "PAID"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
        {order.razorpayPaymentId && (
          <p className="text-xs text-brand-teal/50 mt-2">
            Razorpay Payment ID: {order.razorpayPaymentId}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-4">Items</h2>
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-teal">
                {item.name}
                {item.variantLabel && (
                  <span className="text-brand-teal/50"> ({item.variantLabel})</span>
                )}{" "}
                × {item.quantity}
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
    </div>
  );
}
