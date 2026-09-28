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

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let slug = slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
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

  return NextResponse.json({ product }, { status: 201 });
}
