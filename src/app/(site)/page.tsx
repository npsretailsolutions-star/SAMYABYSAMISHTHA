import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import type { ProductWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, giftIdeas] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isGiftable: true, isActive: true },
      include: { category: true },
      take: 4,
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-cream">
        <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] lg:aspect-[16/6]">
          <Image
            src="/images/hero-banner.webp"
            alt="Samya By Samishtha — Timeless Beauty, Made For You"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-brand-teal/10 bg-white">
        <div className="container-px mx-auto grid grid-cols-2 gap-3 sm:gap-6 py-4 sm:py-6 sm:grid-cols-4">
          {[
            { icon: Sparkles, label: "Premium Finish" },
            { icon: Truck, label: "Pan-India Delivery" },
            { icon: ShieldCheck, label: "Skin Friendly" },
            { icon: Gift, label: "Gift Ready Packaging" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <Icon size={16} className="text-brand-gold-dark sm:hidden" />
              <Icon size={22} className="text-brand-gold-dark hidden sm:block" />
              <span className="text-[11px] sm:text-sm font-medium text-brand-teal">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="pt-8 sm:pt-10 pb-4">
        <div className="container-px mx-auto">
          <div className="text-center mb-6">
            <span className="eyebrow">Curated For You</span>
            <h2 className="mt-2 font-serif text-xl sm:text-2xl font-semibold text-brand-teal">
              Shop by Category
            </h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide justify-start sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group flex shrink-0 flex-col items-center gap-2 w-20 sm:w-auto"
              >
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full bg-brand-teal/5 ring-1 ring-brand-gold/30 transition-shadow group-hover:shadow-gold">
                  <Image
                    src={cat.image || "/images/products/pendants-1.svg"}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="80px"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-brand-teal text-center group-hover:text-brand-gold-dark">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-px mx-auto">
            <div className="text-center mb-8">
              <span className="eyebrow">Handpicked</span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
                Bestsellers
              </h2>
              <Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-gold-dark">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {(featured as ProductWithCategory[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo banner */}
      <section className="section-y">
        <div className="container-px mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-teal-gradient px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="pointer-events-none absolute -left-10 -top-10 h-52 w-52 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-52 w-52 rounded-full bg-brand-gold/10 blur-3xl" />
            <span className="eyebrow">Gifting Made Special</span>
            <h2 className="relative mt-2 font-serif text-2xl sm:text-4xl font-semibold text-brand-cream text-balance">
              Perfect Jewellery Gifts for Every Someone Special
            </h2>
            <p className="relative mt-4 max-w-xl mx-auto text-brand-cream/80 text-balance">
              Beautifully packaged sets, ready to gift — for Rakhi, weddings,
              anniversaries and everyday love.
            </p>
            <Link href="/shop/gifting" className="relative mt-6 inline-flex btn-gold">
              Shop Gifting Edit <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Gift ideas */}
      {giftIdeas.length > 0 && (
        <section className="section-y">
          <div className="container-px mx-auto">
            <div className="text-center mb-8">
              <span className="eyebrow">Gift Ideas</span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
                Ready-to-Gift Favourites
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {(giftIdeas as ProductWithCategory[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
