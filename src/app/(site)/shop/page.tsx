import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import type { ProductWithCategory } from "@/lib/types";
import SortBar from "@/components/SortBar";

export const dynamic = "force-dynamic";

const SORT_MAP: Record<string, object> = {
  featured: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

export default async function ShopAllPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sortKey = searchParams.sort && SORT_MAP[searchParams.sort] ? searchParams.sort : "featured";
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
      orderBy: SORT_MAP[sortKey] as never,
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container-px mx-auto section-y">
      <div className="text-center mb-8">
        <span className="eyebrow">The Full Edit</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal">
          Shop All Jewellery
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/shop/${c.slug}`}
            className="rounded-full border border-brand-teal/20 px-4 py-1.5 text-sm font-medium text-brand-teal hover:bg-brand-teal hover:text-brand-cream transition-colors"
          >
            {c.name}
          </a>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-brand-teal/60">{products.length} products</p>
        <SortBar current={sortKey} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {(products as ProductWithCategory[]).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
