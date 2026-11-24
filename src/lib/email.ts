import { Resend } from "resend";
import { formatINR } from "@/lib/format";
import { GOOGLE_REVIEW_URL } from "@/lib/constants";
import { generateInvoicePdf, invoiceNumber } from "@/lib/invoice";


type SendArgs = Parameters<Resend["emails"]["send"]>[0];

// Resend returns { error } instead of throwing, and rate-limits (429) bursts — retry once and log.
async function sendWithRetry(resend: Resend, args: SendArgs, label: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { error } = await resend.emails.send(args);
      if (!error) return true;
      console.error(`${label}: Resend error (attempt ${attempt})`, error);
    } catch (err) {
      console.error(`${label}: send threw (attempt ${attempt})`, err);
    }
    await new Promise((r) => setTimeout(r, 700 * attempt));
  }
  return false;
}

const ORDER_NOTIFICATION_EMAIL = "npsretailsolutions@gmail.com";
const CUSTOMER_SUPPORT_EMAIL = "care@samyabysamishtha.com";

type OrderForEmail = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discount: number;
  codCharge: number;
  giftTotal: number;
  total: number;
  paymentMethod: string;
  items: { name: string; variantLabel?: string | null; sku?: string | null; price: number; quantity: number }[];
};

export async function sendOrderNotificationEmail(order: OrderForEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping order notification email");
    return;
  }

  const resend = new Resend(apiKey);

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;">${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}${item.sku ? ` <span style="color:#777;">[SKU: ${item.sku}]</span>` : ""} × ${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#0b3d3a;">New Order Received 🎉</h2>
      <p>Order <strong>${order.orderNumber}</strong> (${order.paymentMethod}) has just been placed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
      </table>
      <p style="font-size:14px;color:#0b3d3a;">
        Subtotal: ${formatINR(order.subtotal)}<br/>
        ${order.discount > 0 ? `Discount: -${formatINR(order.discount)}<br/>` : ""}
        ${order.codCharge > 0 ? `COD Charges: +${formatINR(order.codCharge)}<br/>` : ""}
        ${order.giftTotal > 0 ? `Gift Wrapping: +${formatINR(order.giftTotal)}<br/>` : ""}
        <strong>Total: ${formatINR(order.total)}</strong>
      </p>
      <h3 style="color:#0b3d3a;">Shipping To</h3>
      <p style="font-size:14px;">
        ${order.customerName}<br/>
        ${order.address}, ${order.city}, ${order.state} - ${order.pincode}<br/>
        ${order.phone} · ${order.email}
      </p>
    </div>
  `;

  await sendWithRetry(
    resend,
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to: ORDER_NOTIFICATION_EMAIL,
      subject: `New Order: ${order.orderNumber} — ${formatINR(order.total)}`,
      html,
    },
    "Admin order email"
  );
}

export async function sendCustomerOrderConfirmationEmail(order: OrderForEmail & { createdAt?: Date }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping customer order confirmation email");
    return;
  }

  const resend = new Resend(apiKey);

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;">${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const firstName = order.customerName.split(" ")[0];

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#0b3d3a;">Thank you, ${firstName}! 🎉</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed and we're getting it ready.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
      </table>
      <p style="font-size:14px;color:#0b3d3a;">
        Subtotal: ${formatINR(order.subtotal)}<br/>
        ${order.discount > 0 ? `Discount: -${formatINR(order.discount)}<br/>` : ""}
        ${order.codCharge > 0 ? `COD Charges: +${formatINR(order.codCharge)}<br/>` : ""}
        ${order.giftTotal > 0 ? `Gift Wrapping: +${formatINR(order.giftTotal)}<br/>` : ""}
        <strong>Total: ${formatINR(order.total)}</strong> (${order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"})
      </p>
      <h3 style="color:#0b3d3a;">Shipping To</h3>
      <p style="font-size:14px;">
        ${order.customerName}<br/>
        ${order.address}, ${order.city}, ${order.state} - ${order.pincode}<br/>
        ${order.phone}
      </p>
      <p style="font-size:13px;color:#777;margin-top:24px;">
        Your tax invoice is attached (all prices are inclusive of 3% GST). Questions about your order? Reply to this email or reach us at care@samyabysamishtha.com.
      </p>
    </div>
  `;

  let attachments: { filename: string; content: Buffer }[] | undefined;
  try {
    const pdf = await generateInvoicePdf({ ...order, createdAt: order.createdAt ?? new Date() });
    attachments = [{ filename: `${invoiceNumber(order.orderNumber)}.pdf`, content: Buffer.from(pdf) }];
  } catch (err) {
    console.error("Failed to generate invoice PDF", err);
  }

  await sendWithRetry(
    resend,
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to: order.email,
      attachments,
      replyTo: CUSTOMER_SUPPORT_EMAIL,
      subject: `Order Confirmed: ${order.orderNumber} — Samya By Samishtha`,
      html,
    },
    "Customer order email"
  );
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping password reset email");
    return;
  }
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#0b3d3a;">Reset your password</h2>
      <p>Hi ${name.split(" ")[0]}, we received a request to reset the password for your Samya By Samishtha account.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#c9a24a;color:#0b3d3a;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Reset Password</a>
      </p>
      <p style="font-size:13px;color:#777;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
  `;
  await sendWithRetry(
    new Resend(apiKey),
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to,
      replyTo: CUSTOMER_SUPPORT_EMAIL,
      subject: "Reset your Samya By Samishtha password",
      html,
    },
    "Password reset email"
  );
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendOrderShippedEmail(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  courierPartner: string | null;
  trackingNumber: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping order shipped email");
    return false;
  }
  const firstName = esc(order.customerName.split(" ")[0] || order.customerName);
  const courier = order.courierPartner ? esc(order.courierPartner) : "";
  const tracking = order.trackingNumber ? esc(order.trackingNumber) : "";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://samyabysamishtha.com").replace(/\/$/, "");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#0b3d3a;">
      <h2 style="color:#0b3d3a;">Your order is on its way! 🚚</h2>
      <p>Hi ${firstName},</p>
      <p>
        Your order <strong>${esc(order.orderNumber)}</strong> has been shipped${courier ? ` via <strong>${courier}</strong>` : ""}${
          tracking ? ` with tracking ID <strong>&quot;${tracking}&quot;</strong>` : ""
        }.
      </p>
      ${
        tracking
          ? `<p style="font-size:14px;">You can use this tracking ID on the ${courier || "courier"} website to track your parcel.</p>`
          : ""
      }
      <p style="margin:24px 0;">
        <a href="${siteUrl}/track-order" style="background:#c9a24a;color:#0b3d3a;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Track Your Order</a>
      </p>
      <p style="font-size:15px;"><strong>Thank you for shopping with Samya By Samishtha!</strong> 💛</p>
      <p style="font-size:13px;color:#777;margin-top:24px;">
        Questions? Reply to this email or reach us at ${CUSTOMER_SUPPORT_EMAIL}.
      </p>
    </div>
  `;

  return sendWithRetry(
    new Resend(apiKey),
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to: order.email,
      replyTo: CUSTOMER_SUPPORT_EMAIL,
      subject: `Your order ${order.orderNumber} has been shipped — Samya By Samishtha`,
      html,
    },
    "Order shipped email"
  );
}

/** Reminder for a cart left without ordering (see src/lib/abandonedCart.ts). */
export async function sendAbandonedCartEmail(cart: {
  id: string;
  email: string;
  name: string | null;
  items: { name: string; variantLabel?: string | null; price: number; quantity: number; image: string }[];
  subtotal: number;
  offerLines: string[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping abandoned cart email");
    return false;
  }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://samyabysamishtha.com").replace(/\/$/, "");
  const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`);
  const firstName = cart.name ? esc(cart.name.split(" ")[0]) : "";
  const restoreUrl = `${siteUrl}/cart?restore=${encodeURIComponent(cart.id)}`;

  const rows = cart.items
    .slice(0, 8)
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;width:64px;"><img src="${esc(abs(i.image))}" width="56" height="56" alt="" style="border-radius:8px;object-fit:cover;display:block;" /></td>
          <td style="padding:8px 8px;font-size:14px;">${esc(i.name)}${
            i.variantLabel ? `<br/><span style="color:#777;font-size:12px;">${esc(i.variantLabel)}</span>` : ""
          }<br/><span style="color:#777;font-size:12px;">Qty ${i.quantity}</span></td>
          <td style="padding:8px 0;text-align:right;font-size:14px;white-space:nowrap;">${formatINR(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const offers = cart.offerLines.length
    ? `<div style="background:#f8f1e3;border-radius:12px;padding:12px 16px;margin:16px 0;font-size:14px;">
         <strong>Offers running now:</strong><br/>${cart.offerLines.map((l) => `• ${esc(l)}`).join("<br/>")}
       </div>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#0b3d3a;">
      <h2 style="color:#0b3d3a;">You left something beautiful behind 💛</h2>
      <p>Hi${firstName ? ` ${firstName}` : ""},</p>
      <p>Your favourites are still waiting in your cart at Samya By Samishtha. Complete your order before they sell out!</p>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;">${rows}</table>
      <p style="text-align:right;font-size:15px;margin:10px 0;"><strong>Cart total: ${formatINR(cart.subtotal)}</strong></p>
      ${offers}
      <p style="margin:24px 0;text-align:center;">
        <a href="${restoreUrl}" style="background:#c9a24a;color:#0b3d3a;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;">Complete My Order</a>
      </p>
      <p style="font-size:15px;"><strong>Thank you for shopping with Samya By Samishtha!</strong></p>
      <p style="font-size:12px;color:#777;margin-top:24px;">
        You're receiving this because you added items to your cart on samyabysamishtha.com.
        Questions? Reply to this email or write to ${CUSTOMER_SUPPORT_EMAIL}.
      </p>
    </div>
  `;

  return sendWithRetry(
    new Resend(apiKey),
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to: cart.email,
      replyTo: CUSTOMER_SUPPORT_EMAIL,
      subject: "Your cart is waiting 💛 — Samya By Samishtha",
      html,
    },
    "Abandoned cart email"
  );
}

/** Sent when the admin marks an order DELIVERED: thank-you + "Rate us on Google" (if GOOGLE_REVIEW_URL is set). */
export async function sendOrderDeliveredEmail(order: { orderNumber: string; customerName: string; email: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping order delivered email");
    return false;
  }
  const firstName = esc(order.customerName.split(" ")[0] || order.customerName);
  const reviewUrl = GOOGLE_REVIEW_URL;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#0b3d3a;">
      <h2 style="color:#0b3d3a;">Your order has been delivered 🎉</h2>
      <p>Hi ${firstName},</p>
      <p>Your order <strong>${esc(order.orderNumber)}</strong> has been delivered. We hope you love your new jewellery!</p>
      ${
        reviewUrl
          ? `<p>It would mean a lot to us if you could share your experience — it takes less than a minute and helps other customers find us.</p>
             <p style="margin:24px 0;text-align:center;">
               <a href="${esc(reviewUrl)}" style="background:#c9a24a;color:#0b3d3a;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;">⭐ Rate us on Google</a>
             </p>`
          : ""
      }
      <p style="font-size:15px;"><strong>Thank you for shopping with Samya By Samishtha!</strong> 💛</p>
      <p style="font-size:13px;color:#777;margin-top:24px;">
        Any issue with your order? Reply to this email or write to ${CUSTOMER_SUPPORT_EMAIL} within 3 days of delivery.
      </p>
    </div>
  `;

  return sendWithRetry(
    new Resend(apiKey),
    {
      from: "Samya By Samishtha <orders@samyabysamishtha.com>",
      to: order.email,
      replyTo: CUSTOMER_SUPPORT_EMAIL,
      subject: `Your order ${order.orderNumber} has been delivered — Samya By Samishtha`,
      html,
    },
    "Order delivered email"
  );
}
