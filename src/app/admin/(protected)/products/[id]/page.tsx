import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { parseImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Edit Product</h1>
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
    </div>
  );
}
