import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/format";
import { getAdminSession } from "@/lib/auth";

const orderSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Some products were not found" }, { status: 400 });
  }

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product?.name || "a product"}` },
        { status: 400 }
      );
    }
  }

  const subtotal = data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  let discount = 0;
  let couponCode: string | null = null;
  if (data.couponCode) {
    const code = data.couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
      (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minOrderValue
    ) {
      discount =
        coupon.type === "PERCENT"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
      couponCode = coupon.code;
    }
  }
  const total = subtotal - discount;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        notes: data.notes,
        subtotal,
        discount,
        couponCode,
        total,
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: JSON.parse(product.images)[0] || null,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  const admin = getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
