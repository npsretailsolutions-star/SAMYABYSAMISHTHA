import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/auth";
import { WELCOME_COOKIE } from "@/lib/constants";
import { parseItems, saveCartSnapshot } from "@/lib/abandonedCart";

export const dynamic = "force-dynamic";

const str = (max: number) => z.string().trim().max(max);
const itemSchema = z.object({
  productId: str(60),
  variantId: str(60).nullish(),
  variantLabel: str(120).nullish(),
  name: str(200),
  slug: str(200),
  price: z.number().int().min(0).max(10_000_000),
  image: str(500),
  quantity: z.number().int().min(1).max(99),
  stock: z.number().int().min(0).max(100_000),
  sku: str(60).nullish(),
  categorySlug: str(100).optional(),
  categoryName: str(100).optional(),
  isGiftItem: z.boolean().optional(),
});
const schema = z.object({
  items: z.array(itemSchema).max(40),
  email: z.string().trim().email().max(200).optional(),
  name: str(120).optional(),
  phone: str(20).optional(),
  city: str(80).optional(),
});

/**
 * Saves the visitor's cart for the abandoned-cart reminder — only when we know their email:
 * typed at checkout, logged-in customer, or subscriber (welcome popup / footer box).
 */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { items, email, name, phone, city } = parsed.data;

  let resolved: { email: string; source: string } | null = null;
  if (email) resolved = { email, source: "checkout" };
  else {
    const customer = getCustomerSession();
    if (customer) resolved = { email: customer.email, source: "customer" };
    else {
      const cookieEmail = cookies().get(WELCOME_COOKIE)?.value;
      if (cookieEmail) {
        const sub = await prisma.subscriber.findUnique({ where: { email: decodeURIComponent(cookieEmail) } });
        if (sub) resolved = { email: sub.email, source: "subscriber" };
      }
    }
  }
  if (!resolved) return NextResponse.json({ ok: false, reason: "no-email" });

  try {
    await saveCartSnapshot({ ...resolved, name, phone, city, items });
  } catch (e) {
    console.error("cart-snapshot", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** ?restore=<id> from the reminder email: returns the saved items so the cart page can refill the cart. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("restore");
  if (!id || id.length > 40) return NextResponse.json({ items: [] });
  const cart = await prisma.abandonedCart.findUnique({ where: { id }, select: { items: true } });
  return NextResponse.json({ items: cart ? parseItems(cart.items) : [] });
}
