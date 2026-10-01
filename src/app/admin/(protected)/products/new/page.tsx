import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-2">Add Product</h1>
      <p className="text-sm text-brand-teal/60 mb-6">
        Save the product first — you&apos;ll be able to add colour or size variants once it exists.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
