import { prisma } from "@/lib/prisma";
import GiftSetBuilder from "@/components/GiftSetBuilder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Build Your Own Gift Set | Samya By Samishtha",
  description:
    "Mix and match earrings, pendants, bracelets and bangles to build your own custom jewellery gift set.",
};

const SECTION_NAMES = ["Earrings", "Pendants", "Bracelets", "Bangles"];

export default async function BuildYourGiftPage() {
  const categories = await prisma.category.findMany({
    where: { name: { in: SECTION_NAMES } },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isActive: true },
        include: { variants: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Keep a consistent, intentional tab order regardless of DB sortOrder.
  const ordered = SECTION_NAMES.map((name) =>
    categories.find((c) => c.name === name)
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="bg-teal-gradient">
      <div className="container-px mx-auto section-y">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <span className="eyebrow text-brand-gold-light">Custom Gifts</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-brand-cream">
            Build Your Own Gift Set
          </h1>
          <p className="mt-3 text-brand-cream/80">
            Pick a section, choose your favourite pieces, and put together a gift set that&apos;s
            truly yours — earrings, pendants, bracelets, and bangles, all in one order.
          </p>
        </div>

        <GiftSetBuilder
          categories={ordered.map((c) => ({
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
    </div>
  );
}
