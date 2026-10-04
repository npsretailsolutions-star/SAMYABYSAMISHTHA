"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";

type Variant = {
  id: string;
  attributeName: string;
  label: string;
  images: string;
  stock: number;
};

type BuilderProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string;
  variants: Variant[];
};

type BuilderCategory = {
  id: string;
  name: string;
  slug: string;
  products: BuilderProduct[];
};

type SelectionKey = string; // `${productId}:${variantId || ""}`

export default function GiftSetBuilder({ categories }: { categories: BuilderCategory[] }) {
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug);
  const [selections, setSelections] = useState<Record<SelectionKey, number>>({});

  const activeCategory = categories.find((c) => c.slug === activeSlug) || categories[0];

  const allProducts = useMemo(() => {
    const map = new Map<string, { product: BuilderProduct; variant?: Variant }>();
    for (const cat of categories) {
      for (const p of cat.products) {
        if (p.variants.length > 0) {
          for (const v of p.variants) {
            map.set(`${p.id}:${v.id}`, { product: p, variant: v });
          }
        } else {
          map.set(`${p.id}:`, { product: p });
        }
      }
    }
    return map;
  }, [categories]);

  const setQty = (key: SelectionKey, qty: number, maxStock: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[key];
      } else {
        next[key] = Math.min(qty, maxStock);
      }
      return next;
    });
  };

  const selectedEntries = Object.entries(selections)
    .map(([key, qty]) => {
      const entry = allProducts.get(key);
      if (!entry) return null;
      return { key, qty, ...entry };
    })
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const totalItems = selectedEntries.reduce((sum, e) => sum + e.qty, 0);
  const totalPrice = selectedEntries.reduce((sum, e) => sum + e.product.price * e.qty, 0);

  const addSetToCart = () => {
    for (const entry of selectedEntries) {
      const images = parseImages(entry.variant ? entry.variant.images : entry.product.images);
      addItem(
        {
          productId: entry.product.id,
          variantId: entry.variant?.id,
          variantLabel: entry.variant
            ? `${entry.variant.attributeName}: ${entry.variant.label}`
            : undefined,
          name: entry.product.name,
          slug: entry.product.slug,
          price: entry.product.price,
          image: images[0],
          stock: entry.variant ? entry.variant.stock : entry.product.stock,
        },
        entry.qty
      );
    }
    openCart();
    router.push("/cart");
  };

  if (categories.length === 0) {
    return (
      <p className="text-center text-brand-cream/70">
        No categories available for the gift builder yet.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Section tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveSlug(cat.slug)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                activeSlug === cat.slug
                  ? "border-brand-gold bg-brand-gold text-brand-teal-dark"
                  : "border-brand-cream/30 text-brand-cream hover:border-brand-gold"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.products.length === 0 ? (
          <p className="rounded-2xl bg-white/90 p-8 text-center text-sm text-brand-teal/60">
            No products available in {activeCategory.name} right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {activeCategory?.products.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                selections={selections}
                onChangeQty={setQty}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live gift set summary */}
      <div className="h-fit rounded-2xl bg-white p-6 shadow-card lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-brand-teal mb-4">Your Gift Set</h2>

        {selectedEntries.length === 0 ? (
          <p className="text-sm text-brand-teal/50 italic">
            Pick a few pieces to see your gift set here.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {selectedEntries.map((entry) => {
              const images = parseImages(
                entry.variant ? entry.variant.images : entry.product.images
              );
              const maxStock = entry.variant ? entry.variant.stock : entry.product.stock;
              return (
                <div key={entry.key} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-teal/5">
                    <Image src={images[0]} alt={entry.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-brand-teal">
                      {entry.product.name}
                    </p>
                    {entry.variant && (
                      <p className="text-[11px] text-brand-teal/50">
                        {entry.variant.attributeName}: {entry.variant.label}
                      </p>
                    )}
                    <p className="text-[11px] text-brand-teal/50">
                      {entry.qty} × {formatINR(entry.product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty(entry.key, 0, maxStock)}
                    aria-label="Remove"
                    className="p-1 text-brand-teal/40 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-brand-teal/10 pt-4 space-y-1">
          <div className="flex items-center justify-between text-sm text-brand-teal/70">
            <span>{totalItems} item(s)</span>
            <span className="text-base font-semibold text-brand-teal">
              {formatINR(totalPrice)}
            </span>
          </div>
          <p className="text-[11px] text-brand-teal/50">Inclusive of all taxes · Free shipping</p>
        </div>

        <button
          type="button"
          onClick={addSetToCart}
          disabled={selectedEntries.length === 0}
          className="btn-gold w-full mt-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag size={16} /> Add Gift Set to Cart
        </button>
      </div>
    </div>
  );
}

function ProductTile({
  product,
  selections,
  onChangeQty,
}: {
  product: BuilderProduct;
  selections: Record<SelectionKey, number>;
  onChangeQty: (key: SelectionKey, qty: number, maxStock: number) => void;
}) {
  const hasVariants = product.variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? product.variants[0].id : null
  );
  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
    : null;

  const key = `${product.id}:${selectedVariant?.id || ""}`;
  const qty = selections[key] || 0;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  const images = parseImages(selectedVariant ? selectedVariant.images : product.images);
  const outOfStock = maxStock <= 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="relative aspect-square bg-brand-teal/5">
        <Image
          src={images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.2em] text-xs font-medium text-brand-teal">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-teal">{formatINR(product.price)}</p>

        {hasVariants && (
          <select
            value={selectedVariant?.id}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-brand-teal/20 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.attributeName}: {v.label}
              </option>
            ))}
          </select>
        )}

        {outOfStock ? (
          <p className="mt-2 text-[11px] font-medium text-red-600">Out of stock</p>
        ) : (
          <div className="mt-2 flex items-center justify-between rounded-full border border-brand-teal/20 px-2 py-1">
            <button
              type="button"
              onClick={() => onChangeQty(key, qty - 1, maxStock)}
              disabled={qty <= 0}
              aria-label="Decrease quantity"
              className="text-brand-teal disabled:opacity-30"
            >
              <Minus size={13} />
            </button>
            <span className="text-xs font-medium text-brand-teal">{qty}</span>
            <button
              type="button"
              onClick={() => onChangeQty(key, qty + 1, maxStock)}
              disabled={qty >= maxStock}
              aria-label="Increase quantity"
              className="text-brand-teal disabled:opacity-30"
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
