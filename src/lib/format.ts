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

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SBS${y}${m}${d}${rand}`;
}
