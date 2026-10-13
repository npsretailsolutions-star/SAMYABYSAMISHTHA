import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export const maxDuration = 30;

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const customer = await prisma.customer.findUnique({ where: { email } });

  if (customer) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.samyabysamishtha.com";
    const url = `${base}/account/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    await sendPasswordResetEmail(email, customer.name, url);
  }

  // Same response whether or not the account exists, so emails can't be probed.
  return NextResponse.json({ ok: true });
}
