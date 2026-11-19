export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED_CUSTOMER",
  "RETURNED_COURIER",
] as const;

const LABELS: Record<string, string> = {
  RETURNED_CUSTOMER: "Return - Customer Return",
  RETURNED_COURIER: "Return - Courier Return",
};

export function statusLabel(status: string) {
  return LABELS[status] || status.replace(/_/g, " ");
}

/**
 * How an order's amounts count in admin numbers:
 * courier return (RTO) = no sale, so 0; customer return = refunded, so negative; otherwise as-is.
 * Stored amounts in the DB are never changed — only how they are shown/summed.
 */
export function amountFactor(status: string): 1 | 0 | -1 {
  if (status === "RETURNED_COURIER") return 0;
  if (status === "RETURNED_CUSTOMER") return -1;
  return 1;
}

export function signedAmount(status: string, paise: number) {
  return amountFactor(status) * paise || 0; // avoid -0 (shows as "-₹0")
}

/** Gross sales (all non-cancelled orders) minus courier & customer returns = net sales. */
export function salesSummary(orders: { status: string; total: number }[]) {
  let gross = 0;
  let courierReturns = 0;
  let customerReturns = 0;
  let courierReturnCount = 0;
  let customerReturnCount = 0;
  for (const o of orders) {
    if (o.status === "CANCELLED") continue;
    gross += o.total;
    if (o.status === "RETURNED_COURIER") {
      courierReturns += o.total;
      courierReturnCount += 1;
    } else if (o.status === "RETURNED_CUSTOMER") {
      customerReturns += o.total;
      customerReturnCount += 1;
    }
  }
  return {
    gross,
    courierReturns,
    customerReturns,
    courierReturnCount,
    customerReturnCount,
    net: gross - courierReturns - customerReturns,
  };
}
