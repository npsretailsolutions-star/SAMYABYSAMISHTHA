import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { quoteOrder, OrderValidationError } from "@/lib/orders";
import { getRazorpay } from "@/lib/razorpay";

const schema = z.object({
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
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const quote = await quoteOrder(parsed.data.items, parsed.data.couponCode, "RAZORPAY");

    if (quote.total < 100) {
      return NextResponse.json({ error: "Order total is too low to process." }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: quote.total,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: quote.total,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      subtotal: quote.subtotal,
      discount: quote.discount,
      couponCode: quote.couponCode,
    });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Razorpay create-order failed", err);
    return NextResponse.json({ error: "Could not initiate payment. Please try again." }, { status: 500 });
  }
}
