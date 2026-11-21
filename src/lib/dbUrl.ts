/**
 * Normalises a Postgres connection string for Prisma.
 * For Supabase:
 *  - tables live in the "samya" schema (NOT "public", which Supabase's Data API exposes to the browser key)
 *  - the transaction pooler (port 6543) needs pgbouncer=true and a small per-instance pool
 * Non-Supabase URLs are returned unchanged. Keep in sync with scripts/db-push.mjs.
 */
export const SUPABASE_SCHEMA = "samya";

export function normalizeDbUrl(raw: string | undefined, opts: { connectionLimit?: number } = {}) {
  if (!raw || !raw.includes("supabase")) return raw;
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("schema")) u.searchParams.set("schema", SUPABASE_SCHEMA);
    if (u.port === "6543" && !u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
    if (!u.searchParams.has("connection_limit")) {
      u.searchParams.set("connection_limit", String(opts.connectionLimit ?? (u.port === "6543" ? 3 : 1)));
    }
    return u.toString();
  } catch {
    // Unparseable (e.g. unencoded special chars in the password): append what we can.
    const sep = raw.includes("?") ? "&" : "?";
    return raw.includes("schema=") ? raw : `${raw}${sep}schema=${SUPABASE_SCHEMA}`;
  }
}
