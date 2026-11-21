"use client";

import { useCallback, useEffect, useState } from "react";

type Count = { table: string; from: number | string; to: number | string };

export default function MigrateDb() {
  const [counts, setCounts] = useState<Count[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");

  const loadCounts = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/migrate-db", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not load counts");
      return;
    }
    setCounts(data.tables);
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const run = async () => {
    if (!counts) return;
    setRunning(true);
    setError(null);
    try {
      for (const { table } of counts) {
        let cursor: string | null = null;
        let total = 0;
        do {
          setProgress(`Copying ${table}… ${total} rows`);
          const res: Response = await fetch("/api/admin/migrate-db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table, cursor }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || `Failed on ${table}`);
          total += data.copied;
          cursor = data.next;
        } while (cursor);
      }
      setProgress("Done! Check that every row shows ✅ below.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProgress("");
    }
    setRunning(false);
    loadCounts();
  };

  const allMatch = counts?.every((c) => typeof c.from === "number" && c.from === c.to);

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 break-words">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={run} disabled={running || !counts} className="btn-gold !py-2.5 !px-5 disabled:opacity-50">
          {running ? "Copying…" : "Copy all data to Supabase"}
        </button>
        <button onClick={loadCounts} disabled={running} className="btn-outline !py-2.5 !px-5 disabled:opacity-50">
          Re-check counts
        </button>
        {progress && <span className="text-sm text-brand-teal/70">{progress}</span>}
      </div>

      {counts && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-teal/60">
                <th className="p-3">Table</th>
                <th className="p-3">Old database</th>
                <th className="p-3">Supabase</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {counts.map((c) => (
                <tr key={c.table} className="border-t border-brand-teal/10">
                  <td className="p-3 font-medium text-brand-teal">{c.table}</td>
                  <td className="p-3 break-all">{c.from}</td>
                  <td className="p-3 break-all">{c.to}</td>
                  <td className="p-3">{typeof c.from === "number" && c.from === c.to ? "✅" : "⏳"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {allMatch && (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          All data is copied. Now change DATABASE_URL in Vercel to the Supabase Transaction pooler string and redeploy.
        </p>
      )}
    </div>
  );
}
