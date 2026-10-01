import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortBar from "@/components/SortBar";
import CategoryFilters from "@/components/CategoryFilters";
import type { ProductWithCategory } from "@/lib/types";
import type { Prisma } from "@prisma/client";

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
  searchParams: { sort?: string; minPrice?: string; maxPrice?: string; material?: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
  });
  if (!category) notFound();

  const sortKey = searchParams.sort && SORT_MAP[searchParams.sort] ? searchParams.sort : "newest";

  const where: Prisma.ProductWhereInput = {
    categoryId: category.id,
    isActive: true,
  };

  const minPrice = Number(searchParams.minPrice);
  const maxPrice = Number(searchParams.maxPrice);
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice && !Number.isNaN(minPrice) ? { gte: minPrice * 100 } : {}),
      ...(searchParams.maxPrice && !Number.isNaN(maxPrice) ? { lte: maxPrice * 100 } : {}),
    };
  }

  const selectedMaterials = (searchParams.material || "").split(",").filter(Boolean);
  if (selectedMaterials.length > 0) {
    where.material = { in: selectedMaterials };
  }

  const [products, allCategories, materialRows] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: SORT_MAP[sortKey] as never,
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { categoryId: category.id, isActive: true, material: { not: null } },
      select: { material: true },
      distinct: ["material"],
    }),
  ]);

  const materials = materialRows
    .map((r) => r.material)
    .filter((m): m is string => Boolean(m));

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

      <div className="flex flex-col lg:flex-row gap-10">
        <CategoryFilters
          categories={allCategories.map((c) => ({
            name: c.name,
            slug: c.slug,
            count: c._count.products,
          }))}
          currentCategorySlug={category.slug}
          materials={materials}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-brand-teal/60">{products.length} products</p>
            <SortBar current={sortKey} />
          </div>

          {products.length === 0 ? (
            <p className="text-center text-brand-teal/60 py-16">
              No products found matching these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
              {(products as ProductWithCategory[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
