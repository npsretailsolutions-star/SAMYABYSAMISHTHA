import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { WELCOME_COOKIE } from "@/lib/constants";
import { isWelcomeEligible } from "@/lib/welcome";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email, source: "welcome_popup" },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(WELCOME_COOKIE, encodeURIComponent(parsed.data.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ eligible: await isWelcomeEligible() });
}
