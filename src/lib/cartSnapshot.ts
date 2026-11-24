"use client";

import type { CartItem } from "@/lib/types";

const LAST_KEY = "sbs_cart_snapshot_v1";

/** Strip a cart down to what the abandoned-cart reminder / restore link needs. */
function slim(items: CartItem[]) {
  return items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId ?? null,
    variantLabel: i.variantLabel ?? null,
    name: i.name,
    slug: i.slug,
    price: i.price,
    image: i.image,
    quantity: i.quantity,
    stock: i.stock,
    sku: i.sku ?? null,
    categorySlug: i.categorySlug,
    categoryName: i.categoryName,
    isGiftItem: i.isGiftItem,
  }));
}

/**
 * Sends the cart to the server for the abandoned-cart reminder. Without `contact`, the server only stores it
 * if it already knows the visitor's email (logged in / subscribed). Skips unchanged carts.
 */
export function saveCartSnapshot(
  items: CartItem[],
  contact?: { email?: string; name?: string; phone?: string; city?: string }
) {
  const body = JSON.stringify({ items: slim(items), ...contact });
  try {
    if (localStorage.getItem(LAST_KEY) === body) return;
    localStorage.setItem(LAST_KEY, body);
  } catch {
    // ignore
  }
  fetch("/api/cart-snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
