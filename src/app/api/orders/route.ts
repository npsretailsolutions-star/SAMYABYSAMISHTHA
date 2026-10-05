import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession, getCustomerSession } from "@/lib/auth";
import { quoteOrder, createOrderRecord, OrderValidationError } from "@/lib/orders";

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
        variantId: z.string().optional(),
        giftCharge: z.number().int().nonnegative().optional(),
        giftNote: z.string().optional(),
        isGiftItem: z.boolean().optional(),
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

  try {
    const customer = getCustomerSession();
    const quote = await quoteOrder(data.items, data.couponCode, "COD");
    const order = await createOrderRecord(
      data,
      data.items,
      quote,
      {
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: "PENDING",
      },
      customer?.id
    );
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
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
