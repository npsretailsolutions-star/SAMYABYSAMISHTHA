import Link from "next/link";
import { Download } from "lucide-react";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { buildReport, REPORT_TYPES, type ReportType } from "@/lib/reports";

export const dynamic = "force-dynamic";

const PREVIEW_ROWS = 25;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { type?: string; from?: string; to?: string };
}) {
  const type = (REPORT_TYPES.find((t) => t.key === searchParams.type)?.key || "sales") as ReportType;
  const report = await buildReport(type, searchParams.from, searchParams.to);

  const qs = new URLSearchParams();
  if (searchParams.from) qs.set("from", searchParams.from);
  if (searchParams.to) qs.set("to", searchParams.to);
  const rangeQs = qs.toString();
  const downloadHref = `/api/admin/reports/${type}${rangeQs ? `?${rangeQs}` : ""}`;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Reports</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {REPORT_TYPES.map((t) => (
          <Link
            key={t.key}
            href={`/admin/reports?type=${t.key}${rangeQs ? `&${rangeQs}` : ""}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              t.key === type
                ? "bg-brand-teal text-white"
                : "bg-white text-brand-teal shadow-card hover:bg-brand-teal/5"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DateRangeFilter />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-brand-teal/60">
          {REPORT_TYPES.find((t) => t.key === type)?.hint} &middot; {report.rows.length} rows
        </p>
        <a href={downloadHref} className="btn-gold !py-2 !px-5 text-sm inline-flex items-center gap-2">
          <Download size={15} /> Download Excel
        </a>
      </div>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              {report.headers.map((h) => (
                <th key={h} className="px-3 py-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.slice(0, PREVIEW_ROWS).map((r, i) => (
              <tr key={i} className="border-b border-brand-teal/5 last:border-0">
                {r.map((c, j) => (
                  <td key={j} className="px-3 py-2 text-brand-teal/80 whitespace-nowrap">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {report.rows.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No data in this date range.</p>
        )}
      </div>
      {report.rows.length > PREVIEW_ROWS && (
        <p className="mt-3 text-xs text-brand-teal/50">
          Sirf pehli {PREVIEW_ROWS} rows preview mein hain. Poora data Excel mein milega.
        </p>
      )}
    </div>
  );
}
