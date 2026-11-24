import { Eye, Globe2, MapPin, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { formatINR } from "@/lib/format";
import { parseItems as parseCartItems } from "@/lib/abandonedCart";

export const dynamic = "force-dynamic";

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  AE: "UAE",
  CA: "Canada",
  AU: "Australia",
  SG: "Singapore",
};

export default async function AdminTrafficPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const hasFilter = Boolean(searchParams.from || searchParams.to);

  const rangeStart = searchParams.from
    ? new Date(`${searchParams.from}T00:00:00`)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rangeEnd = searchParams.to ? new Date(`${searchParams.to}T23:59:59`) : new Date();

  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalViews, viewsInRange, views7, rangeRows, topPages, cartEventsInRange, topCartProducts] =
    await Promise.all([
      prisma.pageView.count({ where: { eventType: "pageview" } }),
      prisma.pageView.count({
        where: { eventType: "pageview", createdAt: { gte: rangeStart, lte: rangeEnd } },
      }),
      prisma.pageView.count({ where: { eventType: "pageview", createdAt: { gte: since7 } } }),
      prisma.pageView.findMany({
        where: { eventType: "pageview", createdAt: { gte: rangeStart, lte: rangeEnd } },
        select: { country: true, region: true, city: true, path: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { eventType: "pageview", createdAt: { gte: rangeStart, lte: rangeEnd } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.pageView.count({
        where: { eventType: "add_to_cart", createdAt: { gte: rangeStart, lte: rangeEnd } },
      }),
      prisma.pageView.groupBy({
        by: ["meta"],
        where: { eventType: "add_to_cart", createdAt: { gte: rangeStart, lte: rangeEnd } },
        _count: { meta: true },
        orderBy: { _count: { meta: "desc" } },
        take: 8,
      }),
    ]);

  const abandonedCarts = await prisma.abandonedCart.findMany({
    where: { OR: [{ subtotal: { gt: 0 } }, { recoveredAt: { not: null } }] },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const locationMap = new Map<string, { country: string; city: string | null; count: number }>();
  for (const v of rangeRows) {
    const country = v.country || "Unknown";
    const city = v.city;
    const key = `${country}|${city || ""}`;
    const existing = locationMap.get(key);
    if (existing) existing.count += 1;
    else locationMap.set(key, { country, city, count: 1 });
  }
  const topLocations = Array.from(locationMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);

  // Daily chart across the selected range (defaults to last 7 days when no range is chosen).
  const dayMs = 24 * 60 * 60 * 1000;
  const chartStart = hasFilter ? rangeStart : new Date(Date.now() - 6 * dayMs);
  const totalDays = Math.max(
    1,
    Math.min(60, Math.round((rangeEnd.getTime() - chartStart.getTime()) / dayMs) + 1)
  );
  const dayBuckets: Record<string, number> = {};
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(chartStart.getTime() + i * dayMs);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of rangeRows) {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (key in dayBuckets) dayBuckets[key] += 1;
  }
  const maxDay = Math.max(1, ...Object.values(dayBuckets));

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Traffic</h1>

      <DateRangeFilter />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{totalViews}</p>
          <p className="text-sm text-brand-teal/60">Total Page Views (all time)</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{viewsInRange}</p>
          <p className="text-sm text-brand-teal/60">
            {hasFilter ? "Views in Selected Range" : "Last 30 Days"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{views7}</p>
          <p className="text-sm text-brand-teal/60">Last 7 Days</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <ShoppingBag size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{cartEventsInRange}</p>
          <p className="text-sm text-brand-teal/60">
            Add to Cart {hasFilter ? "(Selected Range)" : "(Last 30 Days)"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mb-6">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-4">
          {hasFilter ? "Selected Range" : "Last 7 Days"}
        </h2>
        <div className="flex items-end gap-3 h-32 overflow-x-auto">
          {Object.entries(dayBuckets).map(([day, count]) => (
            <div key={day} className="flex-1 min-w-[18px] flex flex-col items-center gap-2">
              <div className="w-full flex items-end h-24">
                <div
                  className="w-full rounded-t-md bg-gold-gradient"
                  style={{ height: `${Math.max(4, (count / maxDay) * 100)}%` }}
                  title={`${count} views`}
                />
              </div>
              <span className="text-[10px] text-brand-teal/50">
                {new Date(day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag size={18} className="text-brand-gold-dark" />
          <h2 className="font-serif text-base font-semibold text-brand-teal">
            Top Products Added to Cart {hasFilter ? "(Selected Range)" : "(30 days)"}
          </h2>
        </div>
        {topCartProducts.length === 0 ? (
          <p className="text-sm text-brand-teal/60">No add-to-cart activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {topCartProducts.map((p) => (
              <div key={p.meta} className="flex items-center justify-between text-sm">
                <span className="text-brand-teal truncate max-w-[70%]">{p.meta || "Unknown product"}</span>
                <span className="font-medium text-brand-teal">{p._count.meta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 size={18} className="text-brand-gold-dark" />
            <h2 className="font-serif text-base font-semibold text-brand-teal">
              Top Locations {hasFilter ? "(Selected Range)" : "(30 days)"}
            </h2>
          </div>
          {topLocations.length === 0 ? (
            <p className="text-sm text-brand-teal/60">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topLocations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-brand-teal">
                    <MapPin size={14} className="text-brand-teal/40 shrink-0" />
                    {loc.city ? `${loc.city}, ` : ""}
                    {COUNTRY_NAMES[loc.country] || loc.country}
                  </span>
                  <span className="font-medium text-brand-teal">{loc.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-serif text-base font-semibold text-brand-teal mb-4">
            Top Pages {hasFilter ? "(Selected Range)" : "(30 days)"}
          </h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-brand-teal/60">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between text-sm">
                  <span className="text-brand-teal truncate max-w-[70%]">{p.path}</span>
                  <span className="font-medium text-brand-teal">{p._count.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-1">Abandoned Carts</h2>
        <p className="text-xs text-brand-teal/60 mb-4">
          Visitors who added items and gave their email (checkout form, login or subscribe) but didn&apos;t order.
          A reminder email goes automatically ~1 hour after they leave. Latest 50.
        </p>
        {abandonedCarts.length === 0 ? (
          <p className="text-sm text-brand-teal/60">No abandoned carts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
                  <th className="py-2 pr-3 font-medium">Last active</th>
                  <th className="py-2 pr-3 font-medium">Customer</th>
                  <th className="py-2 pr-3 font-medium">Items</th>
                  <th className="py-2 pr-3 font-medium text-right">Value</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {abandonedCarts.map((c) => {
                  const items = parseCartItems(c.items);
                  const phoneDigits = (c.phone || "").replace(/\D/g, "").slice(-10);
                  return (
                    <tr key={c.id} className="border-b border-brand-teal/5 align-top">
                      <td className="py-3 pr-3 whitespace-nowrap text-brand-teal/70">
                        {c.updatedAt.toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pr-3">
                        {c.name && <p className="font-medium text-brand-teal">{c.name}</p>}
                        <a href={`mailto:${c.email}`} className="block text-brand-teal/80 hover:underline break-all">
                          {c.email}
                        </a>
                        {c.phone && (
                          <p className="text-brand-teal/80">
                            <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                            {phoneDigits.length === 10 && (
                              <a
                                href={`https://wa.me/91${phoneDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-emerald-700 hover:underline"
                              >
                                WhatsApp
                              </a>
                            )}
                          </p>
                        )}
                        {c.city && <p className="text-xs text-brand-teal/50">{c.city}</p>}
                      </td>
                      <td className="py-3 pr-3 text-brand-teal/80">
                        {items.length === 0
                          ? "—"
                          : items.map((i, n) => (
                              <p key={n}>
                                {i.name}
                                {i.variantLabel ? ` (${i.variantLabel})` : ""} × {i.quantity}
                              </p>
                            ))}
                      </td>
                      <td className="py-3 pr-3 text-right whitespace-nowrap font-medium text-brand-teal">
                        {c.subtotal > 0 ? formatINR(c.subtotal) : "—"}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        {c.recoveredAt ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                            Ordered {c.recoveredOrderNumber || ""}
                          </span>
                        ) : c.emailSentAt ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            Reminder sent
                          </span>
                        ) : (
                          <span className="rounded-full bg-brand-teal/5 px-2 py-0.5 text-xs text-brand-teal/70">
                            Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
