import { NextRequest, NextResponse } from "next/server";
import { processAbandonedCarts } from "@/lib/abandonedCart";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily Vercel Cron backup for abandoned-cart reminders (they also go out during normal site traffic). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processAbandonedCarts({ force: true });
  return NextResponse.json(result);
}
