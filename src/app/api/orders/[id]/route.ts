import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { sendOrderDeliveredEmail, sendOrderShippedEmail } from "@/lib/email";

const schema = z
  .object({
    status: z.enum(ORDER_STATUSES),
    courierPartner: z.string().trim().max(80),
    trackingNumber: z.string().trim().max(80),
  })
  .partial()
  .refine((d) => d.status !== undefined || d.courierPartner !== undefined || d.trackingNumber !== undefined);

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const before = await prisma.order.findUnique({ where: { id: params.id }, select: { status: true } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.courierPartner !== undefined && {
        courierPartner: parsed.data.courierPartner || null,
      }),
      ...(parsed.data.trackingNumber !== undefined && {
        trackingNumber: parsed.data.trackingNumber || null,
      }),
    },
  });

  // Status just changed to SHIPPED -> tell the customer (awaited: Vercel kills fire-and-forget work).
  let shippedEmailSent: boolean | undefined;
  if (parsed.data.status === "SHIPPED" && before.status !== "SHIPPED") {
    shippedEmailSent = await sendOrderShippedEmail(order);
  }
  // Status just changed to DELIVERED -> thank-you + "Rate us on Google" email.
  let deliveredEmailSent: boolean | undefined;
  if (parsed.data.status === "DELIVERED" && before.status !== "DELIVERED") {
    deliveredEmailSent = await sendOrderDeliveredEmail(order);
  }
  return NextResponse.json({ order, shippedEmailSent, deliveredEmailSent });
}

/** Admin-only: permanently delete an order (e.g. a test order). Puts stock and coupon usage back. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      // updateMany: no error if the product/variant was deleted since.
      if (item.variantId) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else if (item.productId) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }
    await tx.order.delete({ where: { id: order.id } }); // order items cascade
  });

  return NextResponse.json({ ok: true });
}
