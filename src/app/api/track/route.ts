import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const country = req.headers.get("x-vercel-ip-country") || null;
  const region = req.headers.get("x-vercel-ip-country-region") || null;
  const city = req.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(req.headers.get("x-vercel-ip-city")!)
    : null;

  await prisma.pageView.create({
    data: {
      path: parsed.data.path,
      referrer: parsed.data.referrer || null,
      country,
      region,
      city,
    },
  });

  return NextResponse.json({ ok: true });
}
