import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (parsed.data.subtotal < coupon.minOrderValue) {
    return NextResponse.json(
      { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue / 100}` },
      { status: 400 }
    );
  }

  const discount =
    coupon.type === "PERCENT"
      ? Math.round((parsed.data.subtotal * coupon.value) / 100)
      : Math.min(coupon.value, parsed.data.subtotal);

  return NextResponse.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount });
}
