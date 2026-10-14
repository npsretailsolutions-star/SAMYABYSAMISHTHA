import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const rows = ["email,source,subscribed_at"].concat(
    subs.map((s) => `"${s.email.replace(/"/g, '""')}",${s.source},${s.createdAt.toISOString()}`)
  );

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
