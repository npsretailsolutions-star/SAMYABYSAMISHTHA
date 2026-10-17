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
