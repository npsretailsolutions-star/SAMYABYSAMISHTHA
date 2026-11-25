import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

/**
 * Meta Conversions API: sends events from the server so they reach Meta even when the browser Pixel is blocked
 * (ad-blockers, iOS privacy). Each event uses the same event_id as the browser Pixel event, so Meta counts it once.
 * Does nothing unless META_CAPI_TOKEN is set. Set META_CAPI_TEST_CODE to see events under Events Manager → Test events.
 * Must be called inside a request (route handler / server action): it reads IP, user agent and _fbp/_fbc cookies.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2108551593087871";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const norm = (v?: string | null) => (v || "").trim().toLowerCase();

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

function userData(user: CapiUser) {
  const h = headers();
  const c = cookies();
  const email = norm(user.email);
  let phone = (user.phone || "").replace(/\D/g, "");
  if (phone.length === 10) phone = `91${phone}`;
  const [fn, ...rest] = norm(user.name).split(/\s+/).filter(Boolean);
  const ln = rest.length ? rest[rest.length - 1] : "";
  const ct = norm(user.city).replace(/[^a-z]/g, "");
  const st = norm(user.state).replace(/[^a-z]/g, "");
  const zp = (user.zip || "").replace(/\D/g, "");
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || undefined;

  return {
    ...(email && { em: [sha(email)], external_id: [sha(email)] }),
    ...(phone && { ph: [sha(phone)] }),
    ...(fn && { fn: [sha(fn)] }),
    ...(ln && { ln: [sha(ln)] }),
    ...(ct && { ct: [sha(ct)] }),
    ...(st && { st: [sha(st)] }),
    ...(zp && { zp: [sha(zp)] }),
    country: [sha("in")],
    ...(ip && { client_ip_address: ip }),
    ...(h.get("user-agent") && { client_user_agent: h.get("user-agent") }),
    ...(c.get("_fbp")?.value && { fbp: c.get("_fbp")!.value }),
    ...(c.get("_fbc")?.value && { fbc: c.get("_fbc")!.value }),
  };
}

export async function sendMetaEvent(ev: {
  eventName: "Purchase" | "InitiateCheckout" | "AddToCart";
  eventId: string;
  eventSourceUrl?: string;
  user: CapiUser;
  customData: Record<string, unknown>;
}) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return false;

  const body = {
    data: [
      {
        event_name: ev.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: "website",
        ...(ev.eventSourceUrl && { event_source_url: ev.eventSourceUrl }),
        user_data: userData(ev.user),
        custom_data: ev.customData,
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE && { test_event_code: process.env.META_CAPI_TEST_CODE }),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) console.error("Meta CAPI", ev.eventName, res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("Meta CAPI", ev.eventName, e);
    return false;
  }
}
