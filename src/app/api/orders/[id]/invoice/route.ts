import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateInvoicePdf, invoiceNumber } from "@/lib/invoice";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const pdf = await generateInvoicePdf(order);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceNumber(order.orderNumber)}.pdf"`,
    },
  });
}
