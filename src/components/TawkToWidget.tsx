"use client";

import { useEffect } from "react";

export default function TawkToWidget() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID;

  useEffect(() => {
    if (!propertyId || !widgetId) return;
    if (document.getElementById("tawkto-script")) return;

    const script = document.createElement("script");
    script.id = "tawkto-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, [propertyId, widgetId]);

  return null;
}
