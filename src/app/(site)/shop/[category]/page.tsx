import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortBar from "@/components/SortBar";
import CategoryFilters from "@/components/CategoryFilters";
import GiftSetBuilder from "@/components/GiftSetBuilder";
import type { ProductWithCategory } from "@/lib/types";
import type { Prisma } from "@prisma/client";

const GIFT_SET_SECTIONS = ["Earrings", "Pendants", "Bracelets", "Bangles"];

export const dynamic = "force-dynamic";

const SORT_MAP: Record<string, object> = {
  featured: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { sort?: string; minPrice?: string; maxPrice?: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
  });
  if (!category) notFound();

  const sortKey = searchParams.sort && SORT_MAP[searchParams.sort] ? searchParams.sort : "featured";

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

  const isGifting = category.slug === "gifting";

  const [products, allCategories, giftSetCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
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
    isGifting
      ? prisma.category.findMany({
          where: { name: { in: GIFT_SET_SECTIONS } },
          orderBy: { sortOrder: "asc" },
          include: {
            products: {
              where: { isActive: true },
              include: { variants: { orderBy: { sortOrder: "asc" } } },
              orderBy: { createdAt: "desc" },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const orderedGiftSetCategories = GIFT_SET_SECTIONS.map((name) =>
    giftSetCategories.find((c) => c.name === name)
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

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

      {isGifting && orderedGiftSetCategories.length > 0 && (
        <div className="-mx-4 mt-16 rounded-3xl bg-teal-gradient px-4 py-14 sm:-mx-6 sm:px-10">
          <div className="mb-10 max-w-xl mx-auto text-center">
            <span className="eyebrow text-brand-gold-light">Custom Gifts</span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-cream">
              Build Your Own Gift Set
            </h2>
            <p className="mt-3 text-sm text-brand-cream/80">
              Pick a section, choose your favourite pieces, and put together a gift set that&apos;s
              truly yours — earrings, pendants, bracelets, and bangles, all in one order.
            </p>
          </div>
          <GiftSetBuilder
            categories={orderedGiftSetCategories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              products: c.products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                stock: p.stock,
                images: p.images,
                variants: p.variants.map((v) => ({
                  id: v.id,
                  attributeName: v.attributeName,
                  label: v.label,
                  images: v.images,
                  stock: v.stock,
                })),
              })),
            }))}
          />
        </div>
      )}
    </div>
  );
}
