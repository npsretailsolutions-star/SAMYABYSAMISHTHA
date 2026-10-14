// Client-safe offer logic shared by the cart, checkout and the server-side quote.
import { formatINR } from "@/lib/format";

export type OfferKind = "BUNDLE" | "PERCENT" | "PREPAID_PERCENT";

export type OfferData = {
  id: string;
  name: string;
  kind: OfferKind;
  label: string;
  percent: number;
  minSubtotal: number;
  requiresSubscriber: boolean;
  bundleSize: number;
  bundlePrice: number;
  matchType: "SKUS" | "CATEGORY";
  matchValue: string;
  showInPromoBar: boolean;
};

export type OfferLineInput = {
  price: number;
  quantity: number;
  categorySlug?: string | null;
  categoryName?: string | null;
  sku?: string | null;
};

function splitList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function offerMatchesItem(
  offer: OfferData,
  item: { sku?: string | null; categorySlug?: string | null; categoryName?: string | null }
) {
  const list = splitList(offer.matchValue);
  if (offer.matchType === "SKUS") {
    return !!item.sku && list.includes(item.sku.toLowerCase());
  }
  const haystack = `${item.categorySlug || ""} ${item.categoryName || ""}`.toLowerCase();
  return list.some((keyword) => haystack.includes(keyword));
}

// Tag shown on product cards/pages for the bundle offer a product qualifies for.
export function getBundleOfferLabel(
  item: { sku?: string | null; categorySlug?: string | null; categoryName?: string | null },
  offers: OfferData[]
): string | null {
  const offer = offers.find((o) => o.kind === "BUNDLE" && offerMatchesItem(o, item));
  return offer ? offer.label : null;
}

export type AppliedBundle = { offerId: string; label: string; bundles: number; discount: number };

export function computeAutoPricing(
  items: OfferLineInput[],
  subtotal: number,
  offers: OfferData[],
  welcomeEligible: boolean
) {
  // Expand to single units so each unit can belong to at most one bundle.
  const units = items.flatMap((item) =>
    Array.from({ length: Math.max(0, item.quantity) }, () => ({ ...item, used: false }))
  );

  const appliedBundles: AppliedBundle[] = [];
  let bundleDiscount = 0;
  let bundledValue = 0;

  for (const offer of offers.filter((o) => o.kind === "BUNDLE")) {
    // Highest-priced pieces are grouped first — the most generous reading of "any N for ₹X".
    const matching = units
      .filter((u) => !u.used && offerMatchesItem(offer, u))
      .sort((a, b) => b.price - a.price);
    let bundles = 0;
    let discount = 0;
    for (let i = 0; i + offer.bundleSize <= matching.length; i += offer.bundleSize) {
      const chunk = matching.slice(i, i + offer.bundleSize);
      const chunkTotal = chunk.reduce((s, u) => s + u.price, 0);
      // Only bundle when it actually benefits the customer.
      if (chunkTotal > offer.bundlePrice) {
        discount += chunkTotal - offer.bundlePrice;
        bundledValue += chunkTotal;
        bundles += 1;
        chunk.forEach((u) => (u.used = true));
      }
    }
    if (bundles > 0) {
      appliedBundles.push({ offerId: offer.id, label: offer.label, bundles, discount });
      bundleDiscount += discount;
    }
  }

  // Best single % offer that the cart qualifies for (percent offers don't stack).
  let percentOffer: OfferData | null = null;
  for (const offer of offers.filter((o) => o.kind === "PERCENT")) {
    if (subtotal < offer.minSubtotal) continue;
    if (offer.requiresSubscriber && !welcomeEligible) continue;
    if (!percentOffer || offer.percent > percentOffer.percent) percentOffer = offer;
  }

  let prepaidOffer: OfferData | null = null;
  for (const offer of offers.filter((o) => o.kind === "PREPAID_PERCENT")) {
    if (subtotal < offer.minSubtotal) continue;
    if (!prepaidOffer || offer.percent > prepaidOffer.percent) prepaidOffer = offer;
  }

  const remainingSubtotal = subtotal - bundledValue;
  return {
    appliedBundles,
    bundleDiscount,
    bundledValue,
    remainingSubtotal,
    percentOffer,
    percentDiscount: percentOffer ? Math.round((remainingSubtotal * percentOffer.percent) / 100) : 0,
    prepaidOffer,
    prepaidDiscount: prepaidOffer ? Math.round((remainingSubtotal * prepaidOffer.percent) / 100) : 0,
  };
}

// One-line description of an offer for the admin list.
export function describeOffer(o: Pick<OfferData, "kind" | "percent" | "minSubtotal" | "requiresSubscriber" | "bundleSize" | "bundlePrice" | "matchType" | "matchValue">) {
  if (o.kind === "BUNDLE") {
    const what = o.matchType === "SKUS" ? `SKUs: ${o.matchValue}` : `Category contains: ${o.matchValue}`;
    return `Any ${o.bundleSize} at ${formatINR(o.bundlePrice)} — ${what}`;
  }
  const parts = [`${o.percent}% off`];
  if (o.kind === "PREPAID_PERCENT") parts[0] = `Extra ${o.percent}% off on prepaid orders`;
  if (o.minSubtotal > 0) parts.push(`on cart ${formatINR(o.minSubtotal)}+`);
  if (o.requiresSubscriber) parts.push("only for subscribers (gave email)");
  return parts.join(", ");
}
