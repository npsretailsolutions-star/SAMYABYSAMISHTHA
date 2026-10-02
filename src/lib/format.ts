export function formatINR(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatGiftNote(giftWrap?: { box: boolean; card: boolean; cardMessage?: string; pouch: boolean } | null) {
  if (!giftWrap) return undefined;
  const parts: string[] = [];
  if (giftWrap.box) parts.push("Gift Box");
  if (giftWrap.card) parts.push(`Card${giftWrap.cardMessage ? ` (${giftWrap.cardMessage})` : ""}`);
  if (giftWrap.pouch) parts.push("Pouch");
  return parts.length > 0 ? parts.join(", ") : undefined;
}
