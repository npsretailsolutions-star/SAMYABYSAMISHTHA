import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderNumber: z.string().min(3),
  phone: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid order number and phone number." }, { status: 400 });
  }

  const orderNumber = parsed.data.orderNumber.trim().toUpperCase();
  const phoneDigits = parsed.data.phone.replace(/\D/g, "").slice(-10);

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  // Match on the last 10 digits of the phone so the order number alone can't be
  // used to look up someone else's order/address.
  if (!order || !order.phone.replace(/\D/g, "").endsWith(phoneDigits)) {
    return NextResponse.json(
      { error: "No order found with that order number and phone number." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      city: order.city,
      state: order.state,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.name,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
      })),
    },
  });
}
