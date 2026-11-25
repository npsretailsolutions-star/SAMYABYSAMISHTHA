import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/auth";
import { WELCOME_COOKIE } from "@/lib/constants";
import { sendMetaEvent, type CapiUser } from "@/lib/metaCapi";

export const dynamic = "force-dynamic";

// Server copy (Conversions API) of browser Pixel events — same event_id, so Meta deduplicates them.
const schema = z.object({
  event: z.enum(["AddToCart", "InitiateCheckout"]),
  eventId: z.string().min(8).max(64),
  url: z.string().max(500).optional(),
  data: z.object({
    value: z.number().min(0).max(1_000_000),
    currency: z.literal("INR"),
    content_ids: z.array(z.string().max(60)).max(40),
    content_type: z.literal("product"),
    content_name: z.string().max(200).optional(),
    num_items: z.number().int().min(0).max(500).optional(),
  }),
});

export async function POST(req: NextRequest) {
  if (!process.env.META_CAPI_TOKEN) return NextResponse.json({ ok: false });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Best match quality: the visitor's email if we know it (logged in or subscribed).
  const user: CapiUser = {};
  const customer = getCustomerSession();
  if (customer) {
    const c = await prisma.customer.findUnique({ where: { id: customer.id } });
    Object.assign(user, { email: customer.email, name: customer.name, phone: c?.phone, city: c?.city, state: c?.state, zip: c?.pincode });
  } else {
    const sub = cookies().get(WELCOME_COOKIE)?.value;
    if (sub) user.email = decodeURIComponent(sub);
  }

  const ok = await sendMetaEvent({
    eventName: parsed.data.event,
    eventId: parsed.data.eventId,
    eventSourceUrl: parsed.data.url,
    user,
    customData: parsed.data.data,
  });
  return NextResponse.json({ ok });
}
