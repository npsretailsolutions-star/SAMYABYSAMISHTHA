import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import VariantManager from "@/components/admin/VariantManager";
import { parseImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-brand-teal">Edit Product</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price / 100,
          compareAtPrice: product.compareAtPrice ? product.compareAtPrice / 100 : null,
          images: parseImages(product.images),
          stock: product.stock,
          sku: product.sku || "",
          isFeatured: product.isFeatured,
          isGiftable: product.isGiftable,
          isActive: product.isActive,
          material: product.material || "",
          categoryId: product.categoryId,
        }}
      />
      <VariantManager
        productId={product.id}
        variants={product.variants.map((v) => ({
          id: v.id,
          attributeName: v.attributeName,
          label: v.label,
          images: parseImages(v.images),
          stock: v.stock,
          sku: v.sku || "",
        }))}
      />
    </div>
  );
}
