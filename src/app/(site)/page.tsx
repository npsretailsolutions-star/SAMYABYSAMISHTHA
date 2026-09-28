import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import type { ProductWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const AMAZON_STORE_URL =
  "https://www.amazon.in/stores/SAMYABYSAMISHTHA/page/25711CDD-7F40-4A8B-A316-496E24D9FE1B?lp_asin=B0FGJTTMDD&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto";

export default async function HomePage() {
  const [categories, featured, newArrivals, giftIdeas] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
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
      <section className="relative overflow-hidden bg-teal-gradient">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="container-px relative mx-auto grid min-h-[480px] items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="eyebrow">Raksha Bandhan Special Offer</span>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-brand-cream text-balance">
              Elegance Crafted for
              <span className="block text-brand-gold-light">Every Celebration</span>
            </h1>
            <p className="mt-5 max-w-md mx-auto lg:mx-0 text-brand-cream/80 text-balance">
              Discover handcrafted artificial &amp; fashion jewellery — earrings,
              necklaces, bangles &amp; pendants designed to make every moment shine.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 rounded-full bg-brand-cream/10 px-5 py-3 backdrop-blur">
                <span className="text-sm text-brand-cream/80">Flat</span>
                <span className="font-serif text-2xl font-bold text-brand-gold-light">20% OFF</span>
                <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold tracking-wide text-brand-teal-dark">
                  RK20
                </span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link href="/shop" className="btn-gold">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link href="/shop/gifting" className="btn-outline !border-brand-cream/40 !text-brand-cream hover:!bg-brand-cream hover:!text-brand-teal">
                Explore Gifting
              </Link>
            </div>
          </div>

          <div className="relative mx-auto grid max-w-sm grid-cols-2 gap-4">
            {[
              "/images/products/necklace-1.svg",
              "/images/products/earrings-2.svg",
              "/images/products/bangles-3.svg",
              "/images/products/pendants-4.svg",
            ].map((src, i) => (
              <div
                key={src}
                className={`relative aspect-square overflow-hidden rounded-2xl ring-1 ring-brand-gold/30 ${
                  i % 2 === 1 ? "translate-y-6" : ""
                }`}
              >
                <Image src={src} alt="Samya By Samishtha jewellery" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-brand-teal/10 bg-white">
        <div className="container-px mx-auto grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
          {[
            { icon: Sparkles, label: "Premium Finish" },
            { icon: Truck, label: "Pan-India Delivery" },
            { icon: ShieldCheck, label: "Skin Friendly" },
            { icon: Gift, label: "Gift Ready Packaging" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon size={22} className="text-brand-gold-dark" />
              <span className="text-xs sm:text-sm font-medium text-brand-teal">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="section-y">
        <div className="container-px mx-auto">
          <div className="text-center mb-10">
            <span className="eyebrow">Curated For You</span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                image={cat.image || "/images/products/pendants-1.svg"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-px mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="eyebrow">Handpicked</span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
                  Bestsellers
                </h2>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-gold-dark">
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

      {/* New arrivals */}
      <section className="section-y bg-white">
        <div className="container-px mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">Just Dropped</span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
                New Arrivals
              </h2>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-gold-dark">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {(newArrivals as ProductWithCategory[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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

      {/* Amazon store CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="container-px mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-brand-gold/30 bg-white px-6 py-8 sm:px-10">
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-xl font-semibold text-brand-teal">
                Also available on Amazon
              </h3>
              <p className="mt-1 text-sm text-brand-teal/70">
                Shop the Samya By Samishtha official store on Amazon.in
              </p>
            </div>
            <a
              href={AMAZON_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit Amazon Store <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
