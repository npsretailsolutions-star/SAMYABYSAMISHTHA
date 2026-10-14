"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { OfferData } from "@/lib/offers";

type OffersContextValue = { offers: OfferData[]; welcomeEligible: boolean };

const OffersContext = createContext<OffersContextValue>({ offers: [], welcomeEligible: false });

// Active offers come from the server layout; whether this visitor gave their email
// (and so qualifies for subscriber-only offers) is read from the cookie via the API.
export function OffersProvider({
  offers,
  children,
}: {
  offers: OfferData[];
  children: React.ReactNode;
}) {
  const [welcomeEligible, setWelcomeEligible] = useState(false);

  useEffect(() => {
    fetch("/api/subscribe")
      .then((r) => r.json())
      .then((d) => setWelcomeEligible(!!d.eligible))
      .catch(() => {});
  }, []);

  return (
    <OffersContext.Provider value={{ offers, welcomeEligible }}>{children}</OffersContext.Provider>
  );
}

export function useOffers() {
  return useContext(OffersContext);
}
