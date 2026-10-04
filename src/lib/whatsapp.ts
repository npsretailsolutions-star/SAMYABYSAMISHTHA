// Order confirmation via WhatsApp, using Meta's official WhatsApp Cloud API.
//
// Setup needed (one-time, in Meta Business Manager / developers.facebook.com):
//   1. A WhatsApp Business app with a verified sending number.
//   2. A message template named "order_confirmation" (or set
//      WHATSAPP_TEMPLATE_NAME) approved for "Utility" use, with the body:
//      "Hi {{1}}, your order {{2}} worth {{3}} has been confirmed. Thank you
//      for shopping with Samya By Samishtha!" (adjust variable count in the
//      code below to match whatever template you actually create — Meta only
//      allows pre-approved templates for messages sent outside a live chat).
//   3. Env vars (set in Vercel):
//        WHATSAPP_PHONE_NUMBER_ID  - from the Cloud API dashboard
//        WHATSAPP_ACCESS_TOKEN    - a permanent system-user access token
//        WHATSAPP_TEMPLATE_NAME   - optional, defaults to "order_confirmation"

const WHATSAPP_API_VERSION = "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "order_confirmation";

export function isWhatsAppConfigured() {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN);
}

function toE164India(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export async function sendWhatsAppOrderConfirmation(order: {
  orderNumber: string;
  customerName: string;
  phone: string;
  totalFormatted: string;
}) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn("WhatsApp not configured — skipping order confirmation message");
    return { ok: false as const, error: "WhatsApp is not configured" };
  }

  const to = toE164India(order.phone);
  const firstName = order.customerName.split(" ")[0];

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: TEMPLATE_NAME,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: firstName },
                  { type: "text", text: order.orderNumber },
                  { type: "text", text: order.totalFormatted },
                ],
              },
            ],
          },
        }),
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const error = data?.error?.message || `WhatsApp API error (HTTP ${res.status})`;
      console.error("Failed to send WhatsApp order confirmation:", error);
      return { ok: false as const, error };
    }
    return { ok: true as const };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Network error contacting WhatsApp";
    console.error("Failed to send WhatsApp order confirmation:", error);
    return { ok: false as const, error };
  }
}
