import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import VariantManager from "@/components/admin/VariantManager";
import { parseImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { created?: string };
}) {
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
      {searchParams.created && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Product created! If it comes in different sizes or colours, add them below — each
          variant gets its own photos, stock, and SKU.
        </p>
      )}
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
          sortOrder: product.sortOrder,
        }}
      />
      <VariantManager
        productId={product.id}
        productImages={parseImages(product.images)}
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
