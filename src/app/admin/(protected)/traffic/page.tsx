import { Eye, Globe2, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

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

export default async function AdminTrafficPage() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalViews, views30, views7, allRecent, topPages] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: since30 } } }),
    prisma.pageView.count({ where: { createdAt: { gte: since7 } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since30 } },
      select: { country: true, region: true, city: true, path: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since30 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
  ]);

  const locationMap = new Map<string, { country: string; city: string | null; count: number }>();
  for (const v of allRecent) {
    const country = v.country || "Unknown";
    const city = v.city;
    const key = `${country}|${city || ""}`;
    const existing = locationMap.get(key);
    if (existing) existing.count += 1;
    else locationMap.set(key, { country, city, count: 1 });
  }
  const topLocations = Array.from(locationMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);

  const dayBuckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of allRecent) {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (key in dayBuckets) dayBuckets[key] += 1;
  }
  const maxDay = Math.max(1, ...Object.values(dayBuckets));

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Traffic</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{totalViews}</p>
          <p className="text-sm text-brand-teal/60">Total Page Views (all time)</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{views30}</p>
          <p className="text-sm text-brand-teal/60">Last 30 Days</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <Eye size={20} className="text-brand-gold-dark mb-3" />
          <p className="text-2xl font-semibold text-brand-teal">{views7}</p>
          <p className="text-sm text-brand-teal/60">Last 7 Days</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card mb-6">
        <h2 className="font-serif text-base font-semibold text-brand-teal mb-4">
          Last 7 Days
        </h2>
        <div className="flex items-end gap-3 h-32">
          {Object.entries(dayBuckets).map(([day, count]) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 size={18} className="text-brand-gold-dark" />
            <h2 className="font-serif text-base font-semibold text-brand-teal">
              Top Locations (30 days)
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
            Top Pages (30 days)
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
    </div>
  );
}
