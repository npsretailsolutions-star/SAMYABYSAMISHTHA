import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { quoteOrder, createOrderRecord, OrderValidationError } from "@/lib/orders";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        variantId: z.string().optional(),
      })
    )
    .min(1),
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }
  const data = parsed.data;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== data.razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  try {
    const quote = await quoteOrder(data.items, data.couponCode, "RAZORPAY");
    const order = await createOrderRecord(data, data.items, quote, {
      paymentMethod: "RAZORPAY",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Order creation after payment failed", err);
    return NextResponse.json(
      { error: "Payment succeeded but order could not be created. Please contact support." },
      { status: 500 }
    );
  }
}
