import Link from "next/link";
import { Package, ShoppingCart, IndianRupee, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import DateRangeFilter from "@/components/admin/DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const hasFilter = Boolean(searchParams.from || searchParams.to);
  const createdAt: { gte?: Date; lte?: Date } = {};
  if (searchParams.from) createdAt.gte = new Date(`${searchParams.from}T00:00:00`);
  if (searchParams.to) createdAt.lte = new Date(`${searchParams.to}T23:59:59`);
  const dateWhere = hasFilter ? { createdAt } : {};

  const [productCount, orderCount, orders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: dateWhere }),
    prisma.order.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 5 }),
  ]);

  const revenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: "CANCELLED" }, ...dateWhere },
  });
  const revenue = revenueAgg._sum.total || 0;

  const stats = [
    { label: hasFilter ? "Revenue (selected dates)" : "Total Revenue", value: formatINR(revenue), icon: IndianRupee },
    { label: hasFilter ? "Orders (selected dates)" : "Total Orders", value: orderCount, icon: ShoppingCart },
    { label: "Total Products", value: productCount, icon: Package },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Dashboard</h1>

      <DateRangeFilter />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card">
            <Icon size={20} className="text-brand-gold-dark mb-3" />
            <p className="text-2xl font-semibold text-brand-teal">{value}</p>
            <p className="text-sm text-brand-teal/60">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-brand-teal">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-gold-dark hover:underline">
              View All
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-brand-teal/60">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between rounded-xl border border-brand-teal/10 px-4 py-3 hover:bg-brand-teal/5"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-teal">{o.orderNumber}</p>
                    <p className="text-xs text-brand-teal/60">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-teal">{formatINR(o.total)}</p>
                    <span className="text-[11px] uppercase tracking-wide text-brand-gold-dark">
                      {o.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-brand-teal">Low Stock</h2>
            <Link href="/admin/products" className="text-sm font-medium text-brand-gold-dark hover:underline">
              Manage Products
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-brand-teal/60">All products are well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-brand-teal/10 px-4 py-3 hover:bg-brand-teal/5"
                >
                  <p className="text-sm font-medium text-brand-teal">{p.name}</p>
                  <span className="text-sm font-semibold text-red-600">{p.stock} left</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
