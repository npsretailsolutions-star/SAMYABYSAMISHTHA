"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || undefined }),
      keepalive: true,
    }).catch(() => {
      // ignore tracking failures
    });
  }, [pathname]);

  return null;
}
