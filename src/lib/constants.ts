export const ADMIN_COOKIE = "sbs_admin_session";
export const CUSTOMER_COOKIE = "sbs_customer_session";

export const AUTO_DISCOUNT_PERCENT = 10;
export const AUTO_DISCOUNT_LABEL = "10% Welcome Offer";
export const WELCOME_COOKIE = "sbs_welcome_email";

// Shagun Days festive offer: discount steps up to 20% once the cart crosses ₹1000.
export const AUTO_DISCOUNT_THRESHOLD = 100000; // ₹1000 in paise
export const AUTO_DISCOUNT_THRESHOLD_PERCENT = 20;
export const AUTO_DISCOUNT_THRESHOLD_LABEL = "Shagun Days Offer (20% Off)";

// The 10% base discount is a welcome offer: only visitors who shared their email
// get it. The 20% Shagun Days tier applies to everyone.
export function getAutoDiscountPercent(subtotal: number, welcomeEligible: boolean) {
  if (subtotal >= AUTO_DISCOUNT_THRESHOLD) return AUTO_DISCOUNT_THRESHOLD_PERCENT;
  return welcomeEligible ? AUTO_DISCOUNT_PERCENT : 0;
}

export function getAutoDiscountLabel(subtotal: number) {
  return subtotal >= AUTO_DISCOUNT_THRESHOLD ? AUTO_DISCOUNT_THRESHOLD_LABEL : AUTO_DISCOUNT_LABEL;
}

// Shagun Days bundle offers — any 3 eligible pieces at a flat price, replacing
// (not stacked with) the sitewide auto-discount on those specific units.
export const EARRINGS_BUNDLE_SIZE = 3;
export const EARRINGS_BUNDLE_PRICE = 59900; // ₹599 in paise
export const BANGLE_BUNDLE_SIZE = 3;
export const BANGLE_BUNDLE_PRICE = 69900; // ₹699 in paise
export const BANGLE_BUNDLE_SKUS = [
  "KR-172",
  "KR-173",
  "KR-174",
  "KR-175",
  "KR-176",
  "KR-177",
  "KR-178",
  "KR-179",
  "KR-180",
  "KR-181",
  "KR-182",
  "KR-183",
  "KR-184",
  "KR-185",
  "KR-186",
  "KR-187",
];

// Prepaid (Razorpay) orders get an extra discount; COD orders carry a small handling charge.
export const PREPAID_DISCOUNT_PERCENT = 5;
export const COD_CHARGE = 4900; // ₹49 in paise

// Optional gifting add-ons, selectable on the product page.
export const GIFT_BOX_PRICE = 19900; // ₹199 in paise
export const GIFT_CARD_PRICE = 1000; // ₹10 in paise
export const GIFT_POUCH_PRICE = 7900; // ₹79 in paise
export const GIFT_CARD_MESSAGES = [
  "Best Wishes",
  "Happy Anniversary",
  "Bridesmaids Proposal",
  "Happy Birthday",
  "Love You!",
  "Wedding Wishes",
  "Congratulations",
  "Sorry",
  "Thank You!",
  "House Warming",
  "Miss You",
];
