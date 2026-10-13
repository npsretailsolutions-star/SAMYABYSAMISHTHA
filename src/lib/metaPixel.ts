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
