import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const variantSchema = z.object({
  attributeName: z.enum(["Color", "Size"]),
  label: z.string().min(1),
  images: z.array(z.string()).min(1),
  stock: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      attributeName: data.attributeName,
      label: data.label,
      images: JSON.stringify(data.images),
      stock: data.stock,
      sku: data.sku || null,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ variant }, { status: 201 });
}
