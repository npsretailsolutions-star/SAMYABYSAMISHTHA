"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButtons from "@/components/AddToCartButtons";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";

type Variant = {
  id: string;
  attributeName: string;
  label: string;
  images: string;
  stock: number;
};

export default function ProductDetailVariants({
  productId,
  name,
  slug,
  price,
  compareAtPrice,
  discount,
  categoryName,
  description,
  material,
  variants,
  ratingSummary,
  productUrl,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  categoryName: string;
  description: string;
  material: string | null;
  variants: Variant[];
  ratingSummary: ReactNode;
  productUrl: string;
}) {
  const [selectedId, setSelectedId] = useState(variants[0].id);
  const selected = variants.find((v) => v.id === selectedId) || variants[0];
  const selectedImages = parseImages(selected.images);
  const attributeName = selected.attributeName;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery images={selectedImages} name={`${name} - ${selected.label}`} />

      <div>
        <span className="eyebrow">{categoryName}</span>
        <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal text-balance">
          {name}
        </h1>

        <div className="mt-2">{ratingSummary}</div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold text-brand-teal">{formatINR(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <>
              <span className="text-base text-brand-teal/50 line-through">
                {formatINR(compareAtPrice)}
              </span>
              <span className="rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
                {discount}% OFF
              </span>
            </>
          )}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-brand-teal/70">{description}</p>

        {material && (
          <p className="mt-3 text-sm text-brand-teal/70">
            <span className="font-medium text-brand-teal">Material: </span>
            {material}
          </p>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-brand-teal mb-2">
            {attributeName}: <span className="font-semibold">{selected.label}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
              const vImages = parseImages(v.images);
              const isActive = v.id === selectedId;
              if (attributeName === "Size") {
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-brand-teal bg-brand-teal text-brand-cream"
                        : "border-brand-teal/30 text-brand-teal hover:border-brand-teal"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              }
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  title={v.label}
                  className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-colors ${
                    isActive ? "border-brand-gold" : "border-transparent ring-1 ring-brand-teal/15"
                  }`}
                >
                  <Image src={vImages[0]} alt={v.label} fill className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-sm">
          {selected.stock > 0 ? (
            <span className="text-emerald-700 font-medium">
              In Stock {selected.stock <= 5 ? `(Only ${selected.stock} left)` : ""}
            </span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </p>

        <div className="mt-6">
          <AddToCartButtons
            productId={productId}
            variantId={selected.id}
            variantLabel={`${attributeName}: ${selected.label}`}
            name={name}
            slug={slug}
            price={price}
            image={selectedImages[0]}
            stock={selected.stock}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <WishlistButton
            variant="inline"
            item={{
              productId,
              name,
              slug,
              price,
              compareAtPrice,
              image: selectedImages[0],
              stock: selected.stock,
            }}
          />
          <ShareButton name={name} url={productUrl} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-brand-teal/10 pt-6">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Truck size={18} className="text-brand-gold-dark" />
            <span className="text-[11px] text-brand-teal/70">Pan-India Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <ShieldCheck size={18} className="text-brand-gold-dark" />
            <span className="text-[11px] text-brand-teal/70">Skin Friendly</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <RotateCcw size={18} className="text-brand-gold-dark" />
            <span className="text-[11px] text-brand-teal/70">Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
