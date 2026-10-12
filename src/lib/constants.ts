export const ADMIN_COOKIE = "sbs_admin_session";
export const CUSTOMER_COOKIE = "sbs_customer_session";

export const AUTO_DISCOUNT_PERCENT = 10;
export const AUTO_DISCOUNT_LABEL = "10% Off (All Orders)";

// Shagun Days festive offer: discount steps up to 20% once the cart crosses ₹1000.
export const AUTO_DISCOUNT_THRESHOLD = 100000; // ₹1000 in paise
export const AUTO_DISCOUNT_THRESHOLD_PERCENT = 20;
export const AUTO_DISCOUNT_THRESHOLD_LABEL = "Shagun Days Offer (20% Off)";

export function getAutoDiscountPercent(subtotal: number) {
  return subtotal >= AUTO_DISCOUNT_THRESHOLD ? AUTO_DISCOUNT_THRESHOLD_PERCENT : AUTO_DISCOUNT_PERCENT;
}

export function getAutoDiscountLabel(subtotal: number) {
  return subtotal >= AUTO_DISCOUNT_THRESHOLD ? AUTO_DISCOUNT_THRESHOLD_LABEL : AUTO_DISCOUNT_LABEL;
}

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
