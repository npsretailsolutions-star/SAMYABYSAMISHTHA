import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-teal">Subscribers</h1>
          <p className="text-sm text-brand-teal/60">
            {subscribers.length} emails collected from the welcome offer popup
          </p>
        </div>
        <a href="/api/admin/subscribers/export" className="btn-gold text-sm">
          Download CSV
        </a>
      </div>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-brand-teal/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-teal">{s.email}</td>
                <td className="px-4 py-3 text-brand-teal/70">{s.source}</td>
                <td className="px-4 py-3 text-brand-teal/60 whitespace-nowrap">
                  {s.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
