import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string(),
  email: z.string().email(),
  customerName: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  // Open to any visitor — not gated on a verified purchase.
  const purchase = await prisma.order.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      status: { not: "CANCELLED" },
      items: { some: { productId: data.productId } },
    },
    orderBy: { createdAt: "desc" },
  });

  const existing = await prisma.review.findFirst({
    where: { productId: data.productId, email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this product." },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      orderId: purchase?.id,
      customerName: data.customerName,
      email,
      rating: data.rating,
      comment: data.comment,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
