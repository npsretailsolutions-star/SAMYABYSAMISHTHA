// Thin wrapper around the Meta Pixel (fbq). Does nothing until NEXT_PUBLIC_META_PIXEL_ID is set.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: string, data?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventId) window.fbq("track", event, data, { eventID: eventId });
  else window.fbq("track", event, data);
}

/**
 * Browser Pixel event + the same event sent from our server (Meta Conversions API) with a shared event id,
 * so Meta still gets it when the Pixel is blocked and counts it only once when both arrive.
 */
export function trackWithServer(
  event: "AddToCart" | "InitiateCheckout",
  data: {
    value: number;
    currency: "INR";
    content_ids: string[];
    content_type: "product";
    content_name?: string;
    num_items?: number;
  }
) {
  if (typeof window === "undefined") return;
  const eventId = `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  track(event, data, eventId);
  fetch("/api/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, eventId, url: window.location.href, data }),
    keepalive: true,
  }).catch(() => {});
}
