import { prisma } from "@/lib/prisma";
import { parseDateRange } from "@/lib/dateRange";
import { split } from "@/lib/invoice";
import { statusLabel } from "@/lib/orderStatus";

export type ReportType = "sales" | "orders" | "customers";
export type ReportCell = string | number;
export type Report = { title: string; headers: string[]; rows: ReportCell[][] };

export const REPORT_TYPES: { key: ReportType; label: string; hint: string }[] = [
  { key: "sales", label: "Sales Report", hint: "Tax-wise sales, one row per SKU" },
  { key: "orders", label: "Order Report", hint: "Order status, SKU and courier" },
  { key: "customers", label: "Customer Report", hint: "Customer name and contact details" },
];

const rs = (paise: number) => Math.round(paise) / 100;

const fmtDate = (d: Date) =>
  d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export async function buildReport(type: ReportType, from?: string, to?: string): Promise<Report> {
  const range = parseDateRange(from, to);
  const where = from || to ? { createdAt: range } : {};

  if (type === "customers") {
    const orders = await prisma.order.findMany({
      where: { ...where, status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
    });
    const map = new Map<string, { o: (typeof orders)[number]; count: number; spent: number; first: Date }>();
    for (const o of orders) {
      const key = o.email.toLowerCase();
      const cur = map.get(key);
      if (cur) {
        cur.count += 1;
        cur.spent += o.total;
        cur.first = o.createdAt;
      } else {
        map.set(key, { o, count: 1, spent: o.total, first: o.createdAt });
      }
    }
    const rows = Array.from(map.values()).map((c, i) => [
      i + 1,
      c.o.customerName,
      c.o.email,
      c.o.phone,
      c.o.address,
      c.o.city,
      c.o.state,
      c.o.pincode,
      c.count,
      rs(c.spent),
      fmtDate(c.first),
      fmtDate(c.o.createdAt),
    ]);
    return {
      title: "Customer Report",
      headers: [
        "Sr. No.", "Customer Name", "Email", "Phone", "Address", "City", "State", "Pincode",
        "Total Orders", "Total Spent (Rs)", "First Order", "Last Order",
      ],
      rows,
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { sku: true } }, variant: { select: { sku: true } } } },
    },
  });
  const skuOf = (i: (typeof orders)[number]["items"][number]) =>
    i.sku || i.variant?.sku || i.product?.sku || "-";

  if (type === "orders") {
    const rows: ReportCell[][] = [];
    for (const o of orders) {
      for (const i of o.items) {
        rows.push([
          rows.length + 1,
          fmtDate(o.createdAt),
          o.orderNumber,
          skuOf(i),
          i.quantity,
          statusLabel(o.status),
          o.courierPartner || "",
        ]);
      }
    }
    return {
      title: "Order Report",
      headers: ["Sr. No.", "Date", "Order ID", "SKU ID", "Qty", "Order Status", "Courier Partner"],
      rows,
    };
  }

  // Sales report: discount is spread over item lines (same as the invoice) so tax is on what was paid.
  const rows: ReportCell[][] = [];
  for (const o of orders) {
    const isDelhi = o.state.trim().toLowerCase().includes("delhi");
    const gross = o.items.reduce((s, i) => s + i.price * i.quantity, 0) || 1;
    let discountLeft = o.discount;
    const lines = o.items.map((item, idx) => {
      const g = item.price * item.quantity;
      const disc =
        idx === o.items.length - 1
          ? discountLeft
          : Math.min(discountLeft, Math.round((o.discount * g) / gross));
      discountLeft -= disc;
      return { sku: skuOf(item), inclusive: g - disc };
    });
    if (o.giftTotal > 0) lines.push({ sku: "GIFT WRAPPING", inclusive: o.giftTotal });
    if (o.codCharge > 0) lines.push({ sku: "COD CHARGE", inclusive: o.codCharge });

    for (const l of lines) {
      const { taxable, tax } = split(l.inclusive);
      const half = Math.floor(tax / 2);
      rows.push([
        rows.length + 1,
        fmtDate(o.createdAt),
        o.orderNumber,
        statusLabel(o.status),
        o.courierPartner || "",
        o.customerName,
        l.sku,
        rs(taxable),
        rs(tax),
        isDelhi ? rs(half) : 0,
        isDelhi ? rs(tax - half) : 0,
        isDelhi ? 0 : rs(tax),
        o.city,
        o.state,
      ]);
    }
  }
  return {
    title: "Sales Report",
    headers: [
      "Sr. No.", "Date", "Order ID", "Order Status", "Courier Partner", "Customer Name", "SKU ID",
      "Taxable Amount", "Tax Amount", "CGST", "SGST", "IGST", "Billing City", "Billing State",
    ],
    rows,
  };
}
