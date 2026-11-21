import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeDbUrl } from "@/lib/dbUrl";

/**
 * One-time copy of all data from the current database (DATABASE_URL, Prisma Postgres)
 * to Supabase (SUPABASE_DIRECT_URL). Parents are copied before children so foreign keys hold.
 */
export const TABLES = [
  { model: "category", pk: "id" },
  { model: "product", pk: "id" },
  { model: "productVariant", pk: "id" },
  { model: "customer", pk: "id" },
  { model: "order", pk: "id" },
  { model: "orderItem", pk: "id" },
  { model: "orderCounter", pk: "id" },
  { model: "admin", pk: "id" },
  { model: "coupon", pk: "id" },
  { model: "review", pk: "id" },
  { model: "blogPost", pk: "id" },
  { model: "heroBanner", pk: "id" },
  { model: "subscriber", pk: "id" },
  { model: "offer", pk: "id" },
  { model: "siteSetting", pk: "key" },
  { model: "pageView", pk: "id", insertOnly: true }, // big log table: insert new rows only
] as const;

export type TableName = (typeof TABLES)[number]["model"];

type Row = Record<string, unknown>;
type Delegate = {
  count: () => Promise<number>;
  findMany: (args: object) => Promise<Row[]>;
  createMany: (args: object) => Promise<unknown>;
  upsert: (args: object) => Promise<unknown>;
};

const delegate = (client: PrismaClient, model: string) =>
  (client as unknown as Record<string, Delegate>)[model];

let target: PrismaClient | null = null;

/** Returns null when there is nothing to migrate (no Supabase URL, or already running on Supabase). */
export function getTarget() {
  const raw = process.env.SUPABASE_DIRECT_URL;
  if (!raw) return { error: "SUPABASE_DIRECT_URL is not set in Vercel." };
  if ((process.env.DATABASE_URL || "").includes("supabase")) {
    return { error: "The site already runs on Supabase — migration is finished." };
  }
  target ??= new PrismaClient({ datasources: { db: { url: normalizeDbUrl(raw, { connectionLimit: 1 }) } } });
  return { client: target };
}

async function safeCount(client: PrismaClient, model: string) {
  try {
    return await delegate(client, model).count();
  } catch (e) {
    return `error: ${e instanceof Error ? e.message.split("\n").filter(Boolean).pop() : String(e)}`;
  }
}

export async function compareCounts(to: PrismaClient) {
  const rows = [];
  for (const t of TABLES) {
    rows.push({ table: t.model, from: await safeCount(prisma, t.model), to: await safeCount(to, t.model) });
  }
  return rows;
}

/** Copies one batch (ordered by primary key) and returns the cursor for the next batch, or null when done. */
export async function copyBatch(to: PrismaClient, table: string, cursor: string | null, size = 200) {
  const t = TABLES.find((x) => x.model === table);
  if (!t) throw new Error(`Unknown table ${table}`);
  const rows = await delegate(prisma, t.model).findMany({
    orderBy: { [t.pk]: "asc" },
    take: size,
    ...(cursor ? { cursor: { [t.pk]: cursor }, skip: 1 } : {}),
  });
  if (rows.length) {
    if ("insertOnly" in t && t.insertOnly) {
      await delegate(to, t.model).createMany({ data: rows, skipDuplicates: true });
    } else {
      // Upsert so a second run also picks up changes (new orders, status/stock updates).
      await to.$transaction(
        rows.map((row) => {
          const rest = { ...row };
          delete rest[t.pk];
          return delegate(to, t.model).upsert({
            where: { [t.pk]: row[t.pk] },
            create: row,
            update: rest,
          }) as never;
        })
      );
    }
  }
  return {
    copied: rows.length,
    next: rows.length === size ? String(rows[rows.length - 1][t.pk]) : null,
  };
}
