import { INVOICE_LOGO_BASE64 } from "@/lib/invoiceLogo";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Seller details. Set INVOICE_GSTIN in Vercel once the GST number is available.
const SELLER = {
  name: "Samya By Samishtha",
  address: "Plot no 10 and 11, Om Vihar Phase 1A, Behind Mata Roop Rani Maggo Hospital",
  city: "Delhi - 110059, India",
  phone: "+91 80766 21656",
  email: "care@samyabysamishtha.com",
  gstin: process.env.INVOICE_GSTIN || "",
  state: "Delhi",
};

const GST_RATE = 3; // all prices are inclusive of 3% GST
const HSN = "7117"; // imitation jewellery

const TEAL = rgb(0.043, 0.239, 0.227);
const GOLD = rgb(0.788, 0.635, 0.29);
const CREAM = rgb(0.98, 0.96, 0.9);
const GREY = rgb(0.4, 0.4, 0.4);
const LINE = rgb(0.85, 0.85, 0.85);

export type InvoiceOrder = {
  orderNumber: string;
  createdAt: Date;
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
  items: { name: string; variantLabel?: string | null; price: number; quantity: number }[];
};

const rs = (paise: number) =>
  "Rs. " + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// pdf-lib's standard fonts only support WinAnsi characters.
const clean = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

const split = (inclusive: number) => {
  const taxable = Math.round((inclusive * 100) / (100 + GST_RATE));
  return { taxable, tax: inclusive - taxable };
};

function words(n: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""));
  const three = (x: number) =>
    (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "") : "") + (x % 100 ? two(x % 100) : "");
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(two(lakh) + " Lakh");
  if (thousand) parts.push(two(thousand) + " Thousand");
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

export function invoiceNumber(orderNumber: string) {
  return `INV-${orderNumber}`;
}

export async function generateInvoicePdf(order: InvoiceOrder): Promise<Uint8Array> {
  const isDelhi = order.state.trim().toLowerCase().includes("delhi");

  // Spread the order discount across item lines so tax is computed on what was actually paid.
  const grossTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0) || 1;
  let discountLeft = order.discount;
  const lines = order.items.map((item, idx) => {
    const gross = item.price * item.quantity;
    const disc =
      idx === order.items.length - 1
        ? discountLeft
        : Math.min(discountLeft, Math.round((order.discount * gross) / grossTotal));
    discountLeft -= disc;
    const inclusive = gross - disc;
    return {
      desc: item.name + (item.variantLabel ? ` (${item.variantLabel})` : ""),
      hsn: HSN,
      qty: item.quantity,
      rate: item.price,
      inclusive,
      ...split(inclusive),
    };
  });
  const extras: { desc: string; inclusive: number }[] = [];
  if (order.giftTotal > 0) extras.push({ desc: "Gift wrapping / finishing touches", inclusive: order.giftTotal });
  if (order.codCharge > 0) extras.push({ desc: "COD handling charge", inclusive: order.codCharge });
  for (const e of extras) lines.push({ desc: e.desc, hsn: "-", qty: 1, rate: e.inclusive, inclusive: e.inclusive, ...split(e.inclusive) });

  const totalTaxable = lines.reduce((s, l) => s + l.taxable, 0);
  const totalTax = lines.reduce((s, l) => s + l.tax, 0);
  const grandTotal = lines.reduce((s, l) => s + l.inclusive, 0);
  const cgst = Math.floor(totalTax / 2);
  const sgst = totalTax - cgst;

  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595;
  const H = 842;
  const M = 36;
  let page = pdf.addPage([W, H]);

  const text = (p: PDFPage, s: string, x: number, y: number, size = 9, font: PDFFont = reg, color = rgb(0.1, 0.1, 0.1)) =>
    p.drawText(clean(s), { x, y, size, font, color });
  const textRight = (p: PDFPage, s: string, xr: number, y: number, size = 9, font: PDFFont = reg, color = rgb(0.1, 0.1, 0.1)) =>
    p.drawText(clean(s), { x: xr - font.widthOfTextAtSize(clean(s), size), y, size, font, color });
  const fit = (s: string, max: number, size: number, font: PDFFont) => {
    let t = clean(s);
    while (t.length > 3 && font.widthOfTextAtSize(t, size) > max) t = t.slice(0, -2);
    return t === clean(s) ? t : t.trimEnd() + "...";
  };

  const wrap = (s: string, max: number, size: number, font: PDFFont) => {
    const out: string[] = [];
    let cur = "";
    for (const w of clean(s).split(" ")) {
      const next = cur ? cur + " " + w : w;
      if (font.widthOfTextAtSize(next, size) > max && cur) {
        out.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  };

  // Header: logo on top, brand name centred in teal, then the document title
  const logo = await pdf.embedPng(Buffer.from(INVOICE_LOGO_BASE64, "base64"));
  const logoW = 92;
  const logoH = (logo.height / logo.width) * logoW;
  page.drawImage(logo, { x: (W - logoW) / 2, y: H - 24 - logoH, width: logoW, height: logoH });
  const brand = "Samya By Samishtha";
  const brandY = H - 24 - logoH - 26;
  text(page, brand, (W - bold.widthOfTextAtSize(brand, 20)) / 2, brandY, 20, bold, TEAL);
  page.drawLine({ start: { x: W / 2 - 40, y: brandY - 10 }, end: { x: W / 2 + 40, y: brandY - 10 }, thickness: 1.5, color: GOLD });
  const title = "TAX INVOICE";
  text(page, title, (W - bold.widthOfTextAtSize(title, 12)) / 2, brandY - 28, 12, bold, GOLD);
  textRight(page, "Original for Recipient", W - M, brandY - 28, 8, reg, GREY);

  // Meta
  let y = brandY - 62;
  const meta: [string, string][] = [
    ["Invoice No", invoiceNumber(order.orderNumber)],
    ["Invoice Date", order.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    ["Order No", order.orderNumber],
    ["Payment", order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online (Prepaid)"],
  ];
  meta.forEach(([k, v], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    text(page, k, M + col * 270, y - row * 15, 8.5, reg, GREY);
    text(page, v, M + col * 270 + 70, y - row * 15, 9, bold);
  });

  // Seller / buyer boxes
  y -= 46;
  const boxH = 102;
  const colW = (W - 2 * M - 14) / 2;
  [0, 1].forEach((c) => {
    page.drawRectangle({ x: M + c * (colW + 14), y: y - boxH, width: colW, height: boxH, borderColor: LINE, borderWidth: 1 });
    page.drawRectangle({ x: M + c * (colW + 14), y: y - 16, width: colW, height: 16, color: CREAM });
  });
  text(page, "SOLD BY", M + 8, y - 12, 8, bold, TEAL);
  text(page, "BILLED & SHIPPED TO", M + colW + 22, y - 12, 8, bold, TEAL);

  let sy = y - 30;
  text(page, SELLER.name, M + 8, sy, 10, bold);
  [...wrap(SELLER.address, colW - 16, 8.5, reg), SELLER.city, `Phone: ${SELLER.phone}`, SELLER.email].forEach((l) => {
    sy -= 12;
    text(page, l, M + 8, sy, 8.5, reg, GREY);
  });
  if (SELLER.gstin) text(page, `GSTIN: ${SELLER.gstin}`, M + 8, sy - 12, 8.5, bold);

  let by = y - 30;
  const bx = M + colW + 22;
  text(page, order.customerName, bx, by, 10, bold);
  [`${order.address}`, `${order.city}, ${order.state} - ${order.pincode}`, `Phone: ${order.phone}`, order.email].forEach((l) => {
    by -= 12;
    text(page, fit(l, colW - 16, 8.5, reg), bx, by, 8.5, reg, GREY);
  });

  // Table
  y -= boxH + 22;
  const cols = {
    n: M + 6,
    desc: M + 24,
    hsn: 236,
    qty: 280,
    rate: 346,
    taxable: 414,
    gst: 474,
    amt: W - M - 6,
  };
  const header = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20, color: TEAL });
    const hy = y;
    text(page, "#", cols.n, hy, 8, bold, CREAM);
    text(page, "Description", cols.desc, hy, 8, bold, CREAM);
    text(page, "HSN", cols.hsn, hy, 8, bold, CREAM);
    text(page, "Qty", cols.qty, hy, 8, bold, CREAM);
    textRight(page, "Rate (incl.)", cols.rate, hy, 8, bold, CREAM);
    textRight(page, "Taxable", cols.taxable, hy, 8, bold, CREAM);
    textRight(page, `GST ${GST_RATE}%`, cols.gst, hy, 8, bold, CREAM);
    textRight(page, "Amount", cols.amt, hy, 8, bold, CREAM);
    y -= 22;
  };
  header();

  lines.forEach((l, i) => {
    if (y < 150) {
      page = pdf.addPage([W, H]);
      y = H - 60;
      header();
    }
    if (i % 2 === 1) page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20, color: rgb(0.985, 0.98, 0.96) });
    text(page, String(i + 1), cols.n, y, 8.5);
    text(page, fit(l.desc, cols.hsn - cols.desc - 8, 8.5, reg), cols.desc, y, 8.5);
    text(page, l.hsn, cols.hsn, y, 8.5);
    text(page, String(l.qty), cols.qty + 4, y, 8.5);
    textRight(page, rs(l.rate), cols.rate, y, 8.5);
    textRight(page, rs(l.taxable), cols.taxable, y, 8.5);
    textRight(page, rs(l.tax), cols.gst, y, 8.5);
    textRight(page, rs(l.inclusive), cols.amt, y, 8.5, bold);
    y -= 20;
  });
  page.drawLine({ start: { x: M, y: y + 12 }, end: { x: W - M, y: y + 12 }, thickness: 0.8, color: LINE });

  // Totals
  if (y < 190) {
    page = pdf.addPage([W, H]);
    y = H - 60;
  }
  y -= 8;
  const totalsTop = y;
  const tx = 330;
  const row = (label: string, value: string, strong = false) => {
    text(page, label, tx, y, 9, strong ? bold : reg, strong ? TEAL : GREY);
    textRight(page, value, W - M - 6, y, 9, strong ? bold : reg);
    y -= 16;
  };
  row("Item total (MRP)", rs(order.subtotal));
  if (order.discount > 0) row("Discount", "- " + rs(order.discount));
  if (extras.length) row("Other charges", rs(extras.reduce((s, e) => s + e.inclusive, 0)));
  row("Taxable value", rs(totalTaxable));
  if (isDelhi) {
    row(`CGST @ ${GST_RATE / 2}%`, rs(cgst));
    row(`SGST @ ${GST_RATE / 2}%`, rs(sgst));
  } else {
    row(`IGST @ ${GST_RATE}%`, rs(totalTax));
  }
  row("Shipping", "Free");
  y -= 8;
  page.drawRectangle({ x: tx - 8, y: y - 6, width: W - M - tx + 8, height: 24, color: TEAL });
  text(page, "GRAND TOTAL", tx, y + 2, 10, bold, CREAM);
  textRight(page, rs(grandTotal), W - M - 8, y + 2, 11, bold, GOLD);
  y -= 34;

  const rupees = Math.floor(grandTotal / 100);
  const paise = grandTotal % 100;
  text(page, "Amount in words", M, totalsTop, 8, reg, GREY);
  text(page, fit(`Rupees ${words(rupees)}${paise ? ` and ${words(paise)} Paise` : ""} Only`, 270, 9, bold), M, totalsTop - 13, 9, bold);

  // Footer notes
  y = Math.min(y, 140);
  page.drawLine({ start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 }, thickness: 0.8, color: LINE });
  text(page, "Notes", M, y - 8, 8.5, bold, TEAL);
  [
    `All prices are inclusive of ${GST_RATE}% GST. ${isDelhi ? "Intra-state supply: CGST + SGST applied." : "Inter-state supply: IGST applied."}`,
    "Gifting items, bouquets and hampers are final sale and not eligible for return or COD.",
    "For returns/exchanges (eligible items) please write to care@samyabysamishtha.com within the policy window.",
  ].forEach((n, i) => text(page, n, M, y - 22 - i * 12, 8, reg, GREY));
  textRight(page, "Authorised Signatory", W - M, y - 22, 8.5, bold);
  textRight(page, SELLER.name, W - M, y - 34, 8, reg, GREY);

  page.drawRectangle({ x: 0, y: 0, width: W, height: 26, color: TEAL });
  const foot = "Thank you for shopping with Samya By Samishtha  |  samyabysamishtha.com  |  This is a computer generated invoice";
  text(page, foot, (W - reg.widthOfTextAtSize(foot, 8)) / 2, 9, 8, reg, CREAM);

  return pdf.save();
}
