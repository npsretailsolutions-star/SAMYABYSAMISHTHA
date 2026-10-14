import { prisma } from "@/lib/prisma";
import type { OfferData } from "@/lib/offers";

const BANGLE_SKUS = Array.from({ length: 16 }, (_, i) => `KR-${172 + i}`).join(", ");

// The offers that were running before they became admin-editable. Seeded once.
const DEFAULT_OFFERS = [
  {
    name: "Any 3 Earrings @ ₹599",
    kind: "BUNDLE",
    label: "Buy any 3 Earrings @ ₹599",
    bundleSize: 3,
    bundlePrice: 59900,
    matchType: "CATEGORY",
    matchValue: "earring",
    sortOrder: 1,
  },
  {
    name: "Any 3 Bangles @ ₹699",
    kind: "BUNDLE",
    label: "Buy any 3 Bangles @ ₹699",
    bundleSize: 3,
    bundlePrice: 69900,
    matchType: "SKUS",
    matchValue: BANGLE_SKUS,
    sortOrder: 2,
  },
  {
    name: "20% off on ₹1000+",
    kind: "PERCENT",
    label: "20% Off on ₹1000+",
    percent: 20,
    minSubtotal: 100000,
    showInPromoBar: true,
    sortOrder: 3,
  },
  {
    name: "10% off for subscribers",
    kind: "PERCENT",
    label: "10% Off for Subscribers",
    percent: 10,
    requiresSubscriber: true,
    showInPromoBar: true,
    sortOrder: 4,
  },
  {
    name: "Extra 5% off on prepaid orders",
    kind: "PREPAID_PERCENT",
    label: "Extra 5% Off on Prepaid Orders",
    percent: 5,
    showInPromoBar: true,
    sortOrder: 5,
  },
];

async function ensureDefaultOffers() {
  const seeded = await prisma.siteSetting.findUnique({ where: { key: "offers_seeded" } });
  if (seeded) return;
  try {
    // The unique key makes only one concurrent request win the seeding.
    await prisma.siteSetting.create({ data: { key: "offers_seeded", value: "1" } });
  } catch {
    return;
  }
  await prisma.offer.createMany({ data: DEFAULT_OFFERS });
}

export async function getActiveOffers(): Promise<OfferData[]> {
  await ensureDefaultOffers();
  const now = new Date();
  const offers = await prisma.offer.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return offers.map((o) => ({
    id: o.id,
    name: o.name,
    kind: o.kind as OfferData["kind"],
    label: o.label,
    percent: o.percent,
    minSubtotal: o.minSubtotal,
    requiresSubscriber: o.requiresSubscriber,
    bundleSize: o.bundleSize,
    bundlePrice: o.bundlePrice,
    matchType: o.matchType as OfferData["matchType"],
    matchValue: o.matchValue,
    showInPromoBar: o.showInPromoBar,
  }));
}
