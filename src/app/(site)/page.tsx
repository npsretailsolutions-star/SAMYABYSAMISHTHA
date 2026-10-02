import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Feather,
  Gem,
  Gift,
  Heart,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import NewsletterBox from "@/components/NewsletterBox";
import type { ProductWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, giftIdeas] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isGiftable: true, isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
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
        <div className="container-px mx-auto grid grid-cols-4 gap-1.5 sm:gap-6 py-2.5 sm:py-6">
          {[
            { icon: Sparkles, label: "Premium Finish" },
            { icon: Truck, label: "Pan-India Delivery" },
            { icon: ShieldCheck, label: "Skin Friendly" },
            { icon: Gift, label: "Gift Ready" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 sm:gap-2 text-center">
              <Icon size={15} className="text-brand-gold-dark sm:hidden" />
              <Icon size={22} className="text-brand-gold-dark hidden sm:block" />
              <span className="text-[9.5px] leading-tight sm:text-sm font-medium text-brand-teal">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="pt-4 sm:pt-10 pb-3 sm:pb-4">
        <div className="container-px mx-auto">
          <div className="text-center mb-3 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-2xl font-semibold text-brand-teal">
              Shop by Category
            </h2>
          </div>
          <div
            className="grid gap-1.5 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.max(categories.length, 6)}, minmax(0, 1fr))`,
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group flex flex-col items-center gap-1.5 sm:gap-2"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-brand-teal/5 ring-1 ring-brand-gold/20 transition-shadow group-hover:shadow-gold">
                  <Image
                    src={cat.image || "/images/products/pendants-1.svg"}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="120px"
                  />
                </div>
                <span className="text-[10px] sm:text-sm font-medium leading-tight text-brand-teal text-center line-clamp-2 group-hover:text-brand-gold-dark">
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
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="font-serif text-xl sm:text-3xl font-semibold text-brand-teal">
                Bestsellers
              </h2>
              <Link href="/shop" className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-gold-dark">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
              {(giftIdeas as ProductWithCategory[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explore our collections */}
      <section className="section-y bg-white">
        <div className="container-px mx-auto">
          <div className="text-center mb-8">
            <span className="eyebrow">Shop The Look</span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
              Explore Our Collections
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
            {[
              { name: "Earrings", slug: "earrings", tagline: "A touch of charm for every mood", image: "/images/products/earrings-2.svg" },
              { name: "Necklaces", slug: "necklaces", tagline: "Grace in every detail", image: "/images/products/necklace-3.svg" },
              { name: "Bangles", slug: "bangles", tagline: "Tradition meets trend", image: "/images/products/bangles-1.svg" },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-brand-teal/5"
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="font-serif text-xl font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-white/80 mt-1">{c.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-gold-light">
                    Shop Now <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose Samya */}
      <section className="section-y">
        <div className="container-px mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
              Why Choose Samya
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5 sm:gap-4">
            {[
              { icon: Gem, label: "Trendy & Timeless Designs" },
              { icon: Feather, label: "Lightweight & Comfortable" },
              { icon: Sparkles, label: "Premium Finish & Quality" },
              { icon: Gift, label: "Perfect for Gifting" },
              { icon: Heart, label: "Designed for Every Occasion" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/40 text-brand-gold-dark">
                  <Icon size={22} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-brand-teal">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBox />
    </div>
  );
}
