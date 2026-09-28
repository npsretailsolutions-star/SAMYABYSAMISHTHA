import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  images: z.array(z.string()).min(1),
  stock: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isGiftable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  material: z.string().optional().nullable(),
  categoryId: z.string(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      images: JSON.stringify(data.images),
      stock: data.stock,
      sku: data.sku || null,
      isFeatured: data.isFeatured ?? false,
      isGiftable: data.isGiftable ?? false,
      isActive: data.isActive ?? true,
      material: data.material || null,
      categoryId: data.categoryId,
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
