import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  code: z.string().min(2),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().positive(),
  minOrderValue: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
});

export async function GET() {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const code = data.code.trim().toUpperCase();

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 });
  }

  if (data.type === "PERCENT" && data.value > 100) {
    return NextResponse.json({ error: "Percent value cannot exceed 100" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue ?? 0,
      isActive: data.isActive ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      usageLimit: data.usageLimit ?? null,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
