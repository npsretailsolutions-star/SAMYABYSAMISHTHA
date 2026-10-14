"use client";

import { useEffect, useState } from "react";

export function useWelcomeEligible() {
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    fetch("/api/subscribe")
      .then((r) => r.json())
      .then((d) => setEligible(!!d.eligible))
      .catch(() => {});
  }, []);
  return eligible;
}
