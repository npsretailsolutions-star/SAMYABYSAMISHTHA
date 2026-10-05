"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButtons from "@/components/AddToCartButtons";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import ProductAccordion from "@/components/ProductAccordion";
import CareInstructionsBox from "@/components/CareInstructionsBox";
import ProductTrustBadges from "@/components/ProductTrustBadges";
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
  sku,
  name,
  slug,
  price,
  compareAtPrice,
  discount,
  categoryName,
  categorySlug,
  description,
  material,
  variants,
  ratingSummary,
  productUrl,
}: {
  productId: string;
  sku: string | null;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  categoryName: string;
  categorySlug?: string;
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
            categorySlug={categorySlug}
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

        <ProductTrustBadges isGiftItem={categorySlug === "gifting"} />

        <ProductAccordion
          sections={[
            {
              title: "Product Details, Material & Care",
              content: (
                <>
                  {sku && (
                    <p>
                      <span className="font-medium text-brand-teal">SKU: </span>
                      {sku}
                    </p>
                  )}
                  <p className="mt-3">{description}</p>
                  {material && (
                    <>
                      <p className="mt-4 font-medium text-brand-teal">Material &amp; Care</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>
                          <span className="font-medium text-brand-teal">Net Quantity: </span>1
                          Piece
                        </li>
                        <li>
                          <span className="font-medium text-brand-teal">Material: </span>
                          {material}
                        </li>
                      </ul>
                    </>
                  )}
                  <p className="mt-4">
                    <span className="font-medium text-brand-teal">Care Label: </span>
                    It is advisable to avoid contact with water and organic chemicals i.e.
                    perfume sprays. Store jewellery in an airtight box. After use, wipe the
                    jewellery with a soft cotton cloth.
                  </p>
                  <CareInstructionsBox />
                </>
              ),
            },
            {
              title: "Manufacturer Details",
              content: (
                <>
                  <p>
                    <span className="font-medium text-brand-teal">Country of Origin: </span>
                    India
                  </p>
                  <p className="mt-3">
                    <span className="font-medium text-brand-teal">Marketed &amp; Sold By: </span>
                    Samya By Samishtha
                  </p>
                  <p className="mt-3">
                    <span className="font-medium text-brand-teal">Grievance Redressal: </span>
                    care@samyabysamishtha.com · +91 80766 21656
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
