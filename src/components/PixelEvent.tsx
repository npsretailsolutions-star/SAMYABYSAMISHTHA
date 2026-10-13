"use client";

import { useEffect } from "react";
import { track } from "@/lib/metaPixel";

// Fires one Pixel event when mounted. `onceKey` guards against refresh double-counting.
export default function PixelEvent({
  event,
  data,
  onceKey,
}: {
  event: string;
  data?: Record<string, unknown>;
  onceKey?: string;
}) {
  useEffect(() => {
    if (onceKey) {
      try {
        if (sessionStorage.getItem(onceKey)) return;
        sessionStorage.setItem(onceKey, "1");
      } catch {}
    }
    // fbq loads afterInteractive; wait briefly for it.
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (window.fbq || tries > 20) {
        clearInterval(t);
        track(event, data, onceKey);
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
