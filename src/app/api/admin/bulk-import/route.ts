import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  images: z.array(z.string()).min(1),
  stock: z.number().int().nonnegative(),
  sku: z.string(),
  material: z.string().optional().nullable(),
  categorySlug: z.string(),
});

const bodySchema = z.object({ products: z.array(productSchema).min(1) });

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const results: { sku: string; status: "created" | "skipped" | "error"; message?: string }[] = [];

  for (const p of parsed.data.products) {
    try {
      const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
      if (existing) {
        results.push({ sku: p.sku, status: "skipped", message: "SKU already exists" });
        continue;
      }
      const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
      if (!category) {
        results.push({ sku: p.sku, status: "error", message: `Category ${p.categorySlug} not found` });
        continue;
      }
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          images: JSON.stringify(p.images),
          stock: p.stock,
          sku: p.sku,
          material: p.material || null,
          isActive: true,
          isFeatured: false,
          isGiftable: false,
          categoryId: category.id,
        },
      });
      results.push({ sku: p.sku, status: "created" });
    } catch (err) {
      results.push({ sku: p.sku, status: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return NextResponse.json({ results });
}
