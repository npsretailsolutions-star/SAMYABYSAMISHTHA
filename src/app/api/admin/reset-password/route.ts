import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const hash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (
    !admin ||
    admin.resetTokenHash !== hash ||
    !admin.resetTokenExpires ||
    admin.resetTokenExpires < new Date()
  ) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: await bcrypt.hash(parsed.data.password, 10),
      resetTokenHash: null,
      resetTokenExpires: null,
    },
  });
  return NextResponse.json({ ok: true });
}
