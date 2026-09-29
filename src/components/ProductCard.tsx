"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import WishlistButton from "@/components/WishlistButton";
import { formatINR } from "@/lib/format";
import { parseImages, type ProductWithCategory } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const { addItem } = useCart();
  const images = parseImages(product.images);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 2200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brand-teal/5">
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105 ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={i === 0}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === activeIndex ? "bg-brand-gold" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-teal px-2.5 py-1 text-[11px] font-semibold text-brand-cream">
            {discount}% OFF
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-brand-teal">
            Sold Out
          </span>
        )}
      </Link>
      <WishlistButton
        item={{
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: images[0],
          stock: product.stock,
        }}
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] uppercase tracking-wide text-brand-gold-dark">
          {product.category.name}
        </span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-sm sm:text-base font-medium text-brand-teal line-clamp-2 min-h-[2.5em] hover:text-brand-gold-dark">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold text-brand-teal">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-brand-teal/50 line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>
        <button
          onClick={() =>
            product.stock > 0 &&
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: images[0],
              stock: product.stock,
            })
          }
          disabled={product.stock <= 0}
          className="mt-3 flex items-center justify-center gap-2 rounded-full border border-brand-teal py-2 text-xs font-semibold uppercase tracking-wide text-brand-teal transition-colors hover:bg-brand-teal hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag size={14} />
          Add to Bag
        </button>
      </div>
    </div>
  );
}
