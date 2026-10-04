"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Gift, Minus, Plus, Ribbon, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";
import { BouquetIllustration, HamperIllustration } from "@/components/GiftIllustrations";

type GiftMode = "bouquet" | "hamper";

const WRAP_COLORS = [
  { label: "Lavender", hex: "#B9A6E0" },
  { label: "Black", hex: "#1A1A1A" },
  { label: "Pink", hex: "#F2B8C6" },
  { label: "White", hex: "#F5F0E6" },
  { label: "Blue", hex: "#A9D3E8" },
];

const FINISHING_TOUCHES = [
  { key: "babys-breath", label: "Baby's Breath", desc: "Tiny white clusters tucked between the pieces", price: 8000 },
  { key: "eucalyptus", label: "Eucalyptus Leaves", desc: "Soft sage-green leaves for depth", price: 5000 },
  { key: "ribbon", label: "Decorative Ribbon", desc: "A simple satin bow at the neck", price: 3000 },
  { key: "premium-ribbon", label: "Premium Ribbon", desc: "Wide gold-edged ribbon, hand-tied", price: 6000 },
  { key: "message-card", label: "Personalised Message Card", desc: "Your words, handwritten on a card", price: 5000 },
];

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
  const [mode, setMode] = useState<GiftMode | null>(null);
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug);
  const [selections, setSelections] = useState<Record<SelectionKey, number>>({});
  const [wrapColor, setWrapColor] = useState<string | null>(null);
  const [touches, setTouches] = useState<Set<string>>(new Set());

  const toggleTouch = (key: string) => {
    setTouches((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

  const touchesTotal = FINISHING_TOUCHES.filter((t) => touches.has(t.key)).reduce(
    (sum, t) => sum + t.price,
    0
  );

  const totalItems = selectedEntries.reduce((sum, e) => sum + e.qty, 0);
  const totalPrice =
    selectedEntries.reduce((sum, e) => sum + e.product.price * e.qty, 0) + touchesTotal;

  const addSetToCart = () => {
    const giftNoteParts: string[] = [];
    if (wrapColor) giftNoteParts.push(`Wrap: ${wrapColor}`);
    const selectedTouches = FINISHING_TOUCHES.filter((t) => touches.has(t.key));
    if (selectedTouches.length > 0) {
      giftNoteParts.push(selectedTouches.map((t) => t.label).join(", "));
    }
    const giftNote = giftNoteParts.length > 0 ? giftNoteParts.join(" · ") : undefined;

    selectedEntries.forEach((entry, i) => {
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
          // Wrapping/finishing-touch charges apply once to the whole set, so attach to the first item.
          // `card: true` ensures the note text renders wherever gift notes are shown.
          giftWrap: i === 0 && giftNote ? { box: false, card: true, pouch: false, cardMessage: giftNote } : undefined,
          giftCharge: i === 0 ? touchesTotal : undefined,
        },
        entry.qty
      );
    });
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

  const wrapHex = wrapColor ? WRAP_COLORS.find((c) => c.label === wrapColor)?.hex : undefined;

  if (!mode) {
    return (
      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("bouquet")}
          className="group rounded-3xl bg-white/95 p-8 text-center shadow-card transition-transform hover:-translate-y-1 hover:shadow-gold"
        >
          <div className="mx-auto mb-4 h-32 w-32">
            <BouquetIllustration color="#F2B8C6" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-brand-teal">Create a Bouquet</h2>
          <p className="mt-2 text-sm text-brand-teal/60">
            Your pieces wrapped like a flower bouquet, tied with a ribbon bow.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("hamper")}
          className="group rounded-3xl bg-white/95 p-8 text-center shadow-card transition-transform hover:-translate-y-1 hover:shadow-gold"
        >
          <div className="mx-auto mb-4 h-32 w-32">
            <HamperIllustration color="#B9A6E0" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-brand-teal">Create a Hamper</h2>
          <p className="mt-2 text-sm text-brand-teal/60">
            Your pieces packed into a gift basket, finished with a bow.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setMode(null)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-cream/80 hover:text-brand-gold-light"
      >
        <ArrowLeft size={14} /> Change gift type
      </button>
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

        {/* Step 2: Choose your wrapping */}
        <div className="mt-10 rounded-2xl bg-white/90 p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-teal-dark text-xs font-semibold text-brand-cream">
              2
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-brand-teal">
                <Gift size={16} className="text-brand-gold-dark" />{" "}
                {mode === "hamper" ? "Choose your basket colour" : "Choose your wrapping"}
              </h2>
              <p className="text-xs text-brand-teal/60">
                {mode === "hamper"
                  ? "Pick the colour your hamper basket is finished in — included in the price."
                  : "Pick the colour your gift set is wrapped in — included in the price."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WRAP_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setWrapColor(wrapColor === c.label ? null : c.label)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  wrapColor === c.label
                    ? "border-brand-gold bg-brand-gold/10 text-brand-teal"
                    : "border-brand-teal/15 text-brand-teal/80 hover:border-brand-gold"
                }`}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-md border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Finishing touches */}
        <div className="mt-6 rounded-2xl bg-white/90 p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-teal-dark text-xs font-semibold text-brand-cream">
              3
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-brand-teal">
                <Ribbon size={16} className="text-brand-gold-dark" /> Add the finishing touches
              </h2>
              <p className="text-xs text-brand-teal/60">
                Optional, but they are what make it look gift-shop made.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FINISHING_TOUCHES.map((t) => {
              const active = touches.has(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTouch(t.key)}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    active
                      ? "border-brand-gold bg-brand-gold/10"
                      : "border-brand-teal/15 hover:border-brand-gold"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        active ? "border-brand-teal bg-brand-teal" : "border-brand-teal/30"
                      }`}
                    >
                      {active && <Check size={11} className="text-brand-cream" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-brand-teal">{t.label}</p>
                      <p className="text-[11px] text-brand-teal/50">{t.desc}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-gold-dark">
                    +{formatINR(t.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live gift set summary */}
      <div className="h-fit rounded-2xl bg-white p-6 shadow-card lg:sticky lg:top-24">
        <div className="mx-auto mb-3 h-28 w-28">
          {mode === "hamper" ? (
            <HamperIllustration color={wrapHex || "#B9A6E0"} />
          ) : (
            <BouquetIllustration color={wrapHex || "#F2B8C6"} />
          )}
        </div>
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

        <div className="border-t border-brand-teal/10 pt-4 space-y-1.5">
          {wrapColor && (
            <div className="flex items-center justify-between text-xs text-brand-teal/60">
              <span>Wrapping: {wrapColor}</span>
              <span>Included</span>
            </div>
          )}
          {touches.size > 0 && (
            <div className="flex items-center justify-between text-xs text-brand-teal/60">
              <span>Finishing touches ({touches.size})</span>
              <span>+{formatINR(touchesTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-sm text-brand-teal/70">
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
