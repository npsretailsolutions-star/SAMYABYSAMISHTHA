import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      customerName: true,
      phone: true,
      city: true,
      state: true,
      total: true,
      createdAt: true,
    },
  });

  const customerMap = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string;
      location: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: Date;
    }
  >();

  for (const o of orders) {
    const key = o.email.toLowerCase();
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    } else {
      customerMap.set(key, {
        email: o.email,
        name: o.customerName,
        phone: o.phone,
        location: `${o.city}, ${o.state}`,
        orderCount: 1,
        totalSpent: o.total,
        lastOrderAt: o.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-brand-teal">Customers</h1>
        <p className="text-sm text-brand-teal/60">{customers.length} total</p>
      </div>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-brand-teal/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-teal">{c.name}</td>
                <td className="px-4 py-3 text-brand-teal/70">
                  <div>{c.email}</div>
                  <div className="text-xs text-brand-teal/50">{c.phone}</div>
                </td>
                <td className="px-4 py-3 text-brand-teal/70">{c.location}</td>
                <td className="px-4 py-3 text-brand-teal/70">{c.orderCount}</td>
                <td className="px-4 py-3 font-medium text-brand-teal">{formatINR(c.totalSpent)}</td>
                <td className="px-4 py-3 text-brand-teal/60 whitespace-nowrap">
                  {c.lastOrderAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">
            No customers yet.{" "}
            <Link href="/admin/orders" className="text-brand-gold-dark hover:underline">
              View orders
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
