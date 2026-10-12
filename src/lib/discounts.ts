import {
  EARRINGS_BUNDLE_SIZE,
  EARRINGS_BUNDLE_PRICE,
  BANGLE_BUNDLE_SIZE,
  BANGLE_BUNDLE_PRICE,
  BANGLE_BUNDLE_SKUS,
} from "@/lib/constants";

export type BundleLineInput = {
  price: number;
  quantity: number;
  categorySlug?: string | null;
  categoryName?: string | null;
  sku?: string | null;
};

function isEarringCategory(slug?: string | null, name?: string | null) {
  if (slug && slug.toLowerCase().includes("earring")) return true;
  if (name && name.toLowerCase().includes("earring")) return true;
  return false;
}

function bundleDiscountFor(units: number[], size: number, bundlePrice: number) {
  // Sort high-to-low so the customer's 3 most expensive eligible pieces get
  // grouped into the flat-price bundle first — the most generous reading of
  // "any 3 for ₹X".
  const sorted = [...units].sort((a, b) => b - a);
  let discount = 0;
  let bundles = 0;
  let bundledValue = 0;
  for (let i = 0; i + size <= sorted.length; i += size) {
    const chunk = sorted.slice(i, i + size);
    const chunkTotal = chunk.reduce((s, v) => s + v, 0);
    // Only group into a bundle when it actually benefits the customer.
    if (chunkTotal > bundlePrice) {
      discount += chunkTotal - bundlePrice;
      bundledValue += chunkTotal;
      bundles += 1;
    }
  }
  return { discount, bundles, bundledValue };
}

export function computeBundleDiscount(items: BundleLineInput[]) {
  const earringUnits: number[] = [];
  const bangleUnits: number[] = [];

  for (const item of items) {
    const qty = Math.max(0, item.quantity);
    if (isEarringCategory(item.categorySlug, item.categoryName)) {
      for (let i = 0; i < qty; i++) earringUnits.push(item.price);
    }
    if (item.sku && BANGLE_BUNDLE_SKUS.includes(item.sku)) {
      for (let i = 0; i < qty; i++) bangleUnits.push(item.price);
    }
  }

  const earrings = bundleDiscountFor(earringUnits, EARRINGS_BUNDLE_SIZE, EARRINGS_BUNDLE_PRICE);
  const bangles = bundleDiscountFor(bangleUnits, BANGLE_BUNDLE_SIZE, BANGLE_BUNDLE_PRICE);

  return {
    totalDiscount: earrings.discount + bangles.discount,
    totalBundledValue: earrings.bundledValue + bangles.bundledValue,
    earringsBundles: earrings.bundles,
    bangleBundles: bangles.bundles,
  };
}
