import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortBar from "@/components/SortBar";
import type { ProductWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORT_MAP: Record<string, object> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { sort?: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
  });
  if (!category) notFound();

  const sortKey = searchParams.sort && SORT_MAP[searchParams.sort] ? searchParams.sort : "newest";
  const products = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    include: { category: true },
    orderBy: SORT_MAP[sortKey] as never,
  });

  return (
    <div className="container-px mx-auto section-y">
      <div className="text-center mb-8">
        <span className="eyebrow">Collection</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-xl mx-auto text-sm text-brand-teal/60">
            {category.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-brand-teal/60">{products.length} products</p>
        <SortBar current={sortKey} />
      </div>

      {products.length === 0 ? (
        <p className="text-center text-brand-teal/60 py-16">
          No products found in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(products as ProductWithCategory[]).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
