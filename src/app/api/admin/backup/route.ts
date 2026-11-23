import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Admin-only full database backup as one JSON file (Supabase free plan has no backups).
 * Tables are listed parents-first so the file can be restored in this order.
 * Contains customer details and password hashes — the owner should store it privately.
 */
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tables = {
    category: await prisma.category.findMany(),
    product: await prisma.product.findMany(),
    productVariant: await prisma.productVariant.findMany(),
    customer: await prisma.customer.findMany(),
    order: await prisma.order.findMany(),
    orderItem: await prisma.orderItem.findMany(),
    orderCounter: await prisma.orderCounter.findMany(),
    admin: await prisma.admin.findMany(),
    coupon: await prisma.coupon.findMany(),
    review: await prisma.review.findMany(),
    blogPost: await prisma.blogPost.findMany(),
    heroBanner: await prisma.heroBanner.findMany(),
    subscriber: await prisma.subscriber.findMany(),
    offer: await prisma.offer.findMany(),
    siteSetting: await prisma.siteSetting.findMany(),
    pageView: await prisma.pageView.findMany(),
  };

  const counts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]));
  const now = new Date();
  const body = JSON.stringify({ createdAt: now.toISOString(), version: 1, counts, tables });
  const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="samya-backup-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
