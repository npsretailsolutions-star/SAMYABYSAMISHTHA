// Build step: apply prisma/schema.prisma to the database.
// If SUPABASE_DIRECT_URL is set (Supabase session pooler / direct string), the schema is pushed THERE
// (used while moving to Supabase, and afterwards because DATABASE_URL is then the transaction pooler,
// which cannot run schema changes). Otherwise it is pushed to DATABASE_URL as before.
import { execSync } from "node:child_process";

function normalize(raw) {
  if (!raw || !raw.includes("supabase")) return raw;
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("schema")) u.searchParams.set("schema", "samya");
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    return u.toString();
  } catch {
    const sep = raw.includes("?") ? "&" : "?";
    return raw.includes("schema=") ? raw : `${raw}${sep}schema=samya`;
  }
}

const target = process.env.SUPABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!target) {
  console.log("db-push: no database URL set, skipping");
  process.exit(0);
}
console.log(`db-push: pushing schema to ${process.env.SUPABASE_DIRECT_URL ? "SUPABASE_DIRECT_URL" : "DATABASE_URL"}`);
execSync("npx prisma db push --accept-data-loss --skip-generate", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: normalize(target) },
});
