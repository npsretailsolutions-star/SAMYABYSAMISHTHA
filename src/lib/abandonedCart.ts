import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/email";
import { getActiveOffers } from "@/lib/offersServer";

/** Reminder goes out this long after the cart was last touched… */
export const REMIND_AFTER_MS = 60 * 60 * 1000; // 1 hour
/** …but not for carts older than this. */
const REMIND_WITHIN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
/** A new reminder is allowed again only this long after the previous one. */
const RESEND_GAP_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_PER_RUN = 5;

export type SnapshotItem = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  sku?: string | null;
  categorySlug?: string;
  categoryName?: string;
  isGiftItem?: boolean;
};

export function parseItems(json: string): SnapshotItem[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function saveCartSnapshot(input: {
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  items: SnapshotItem[];
  source: string;
}) {
  const email = input.email.trim().toLowerCase();
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const items = JSON.stringify(input.items);
  const contact = {
    ...(input.name && { name: input.name }),
    ...(input.phone && { phone: input.phone }),
    ...(input.city && { city: input.city }),
  };

  const existing = await prisma.abandonedCart.findUnique({ where: { email } });

  if (input.items.length === 0) {
    // Cart emptied without ordering: nothing to remind about (keep recovered rows as they are).
    if (existing && !existing.recoveredAt) {
      await prisma.abandonedCart.update({ where: { email }, data: { items: "[]", subtotal: 0, ...contact } });
    }
    return;
  }

  if (!existing) {
    await prisma.abandonedCart.create({ data: { email, items, subtotal, source: input.source, ...contact } });
    return;
  }

  const now = Date.now();
  const startNewCart = existing.recoveredAt !== null; // shopping again after an order
  const allowNewReminder =
    startNewCart || !existing.emailSentAt || now - existing.emailSentAt.getTime() > RESEND_GAP_MS;

  await prisma.abandonedCart.update({
    where: { email },
    data: {
      items,
      subtotal,
      ...contact,
      ...(startNewCart && { recoveredAt: null, recoveredOrderNumber: null, createdAt: new Date(), source: input.source }),
      ...(allowNewReminder && { emailSentAt: null }),
    },
  });
}

/** Called after an order is placed: that email's cart is no longer abandoned. */
export async function markCartRecovered(email: string, orderNumber: string) {
  await prisma.abandonedCart.updateMany({
    where: { email: email.trim().toLowerCase(), recoveredAt: null },
    data: { recoveredAt: new Date(), recoveredOrderNumber: orderNumber },
  });
}

let lastRun = 0;

/**
 * Sends reminder emails for carts idle for 1h+ (max a few per run). Cheap to call often: it runs at most
 * every 10 minutes per server instance. Each cart is claimed atomically so it is emailed only once.
 */
export async function processAbandonedCarts({ force = false } = {}) {
  if (!force && Date.now() - lastRun < 10 * 60 * 1000) return { skipped: true, sent: 0 };
  lastRun = Date.now();

  const now = Date.now();
  const due = await prisma.abandonedCart.findMany({
    where: {
      emailSentAt: null,
      recoveredAt: null,
      subtotal: { gt: 0 },
      updatedAt: { lt: new Date(now - REMIND_AFTER_MS), gt: new Date(now - REMIND_WITHIN_MS) },
    },
    orderBy: { updatedAt: "asc" },
    take: MAX_PER_RUN,
  });
  if (due.length === 0) return { skipped: false, sent: 0 };

  const offers = await getActiveOffers().catch(() => []);
  const offerLines = offers.filter((o) => o.showInPromoBar).map((o) => o.label);
  let sent = 0;

  for (const cart of due) {
    // Already ordered with this email since the cart started? Then it's recovered, not abandoned.
    const order = await prisma.order.findFirst({
      where: { email: { equals: cart.email, mode: "insensitive" }, createdAt: { gte: cart.createdAt } },
      select: { orderNumber: true },
    });
    if (order) {
      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { recoveredAt: new Date(), recoveredOrderNumber: order.orderNumber },
      });
      continue;
    }

    const claimed = await prisma.abandonedCart.updateMany({
      where: { id: cart.id, emailSentAt: null },
      data: { emailSentAt: new Date() },
    });
    if (claimed.count !== 1) continue;

    const ok = await sendAbandonedCartEmail({
      id: cart.id,
      email: cart.email,
      name: cart.name,
      items: parseItems(cart.items),
      subtotal: cart.subtotal,
      offerLines,
    });
    if (ok) sent += 1;
    else await prisma.abandonedCart.update({ where: { id: cart.id }, data: { emailSentAt: null } });
  }
  return { skipped: false, sent };
}
