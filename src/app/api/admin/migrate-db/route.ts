import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { compareCounts, copyBatch, getTarget } from "@/lib/migrateDb";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const errMsg = (e: unknown) =>
  e instanceof Error ? e.message.split("\n").filter(Boolean).slice(-2).join(" ") : String(e);

/** Row counts per table: current database vs Supabase. */
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const target = getTarget();
  if (!target.client) return NextResponse.json({ error: target.error }, { status: 400 });
  try {
    return NextResponse.json({ tables: await compareCounts(target.client) });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

/** Copy one batch of one table. Body: { table, cursor } */
export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const target = getTarget();
  if (!target.client) return NextResponse.json({ error: target.error }, { status: 400 });
  const { table, cursor } = (await req.json()) as { table: string; cursor: string | null };
  try {
    return NextResponse.json(await copyBatch(target.client, table, cursor ?? null));
  } catch (e) {
    return NextResponse.json({ error: `${table}: ${errMsg(e)}` }, { status: 500 });
  }
}
