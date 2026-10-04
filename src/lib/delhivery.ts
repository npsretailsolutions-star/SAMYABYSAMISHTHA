// Delhivery "Create Shipment" integration.
// Requires a Delhivery seller/API account: an API token and a pickup location
// name that is already registered in the Delhivery dashboard.
//
// Env vars (set in Vercel):
//   DELHIVERY_API_TOKEN      - API token from the Delhivery seller panel
//   DELHIVERY_PICKUP_LOCATION - exact registered pickup location/warehouse name
//   DELHIVERY_BASE_URL       - optional, defaults to production (track.delhivery.com);
//                              use https://staging-express.delhivery.com for testing

const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_PICKUP_LOCATION = process.env.DELHIVERY_PICKUP_LOCATION;

export function isDelhiveryConfigured() {
  return Boolean(DELHIVERY_API_TOKEN && DELHIVERY_PICKUP_LOCATION);
}

export type DelhiveryShipmentInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "COD" | "RAZORPAY";
  /** Rupees, not paise. */
  codAmount: number;
  /** Rupees, not paise. */
  totalAmount: number;
  productsDesc: string;
};

export type DelhiveryResult = { ok: true; waybill: string } | { ok: false; error: string };

export async function createDelhiveryShipment(
  input: DelhiveryShipmentInput
): Promise<DelhiveryResult> {
  if (!DELHIVERY_API_TOKEN || !DELHIVERY_PICKUP_LOCATION) {
    return { ok: false, error: "Delhivery is not configured (missing API token or pickup location)" };
  }

  const payload = {
    shipments: [
      {
        name: input.customerName,
        add: input.address,
        pin: input.pincode,
        city: input.city,
        state: input.state,
        country: "India",
        phone: input.phone,
        order: input.orderNumber,
        payment_mode: input.paymentMethod === "COD" ? "COD" : "Prepaid",
        products_desc: input.productsDesc.slice(0, 500),
        cod_amount: input.paymentMethod === "COD" ? input.codAmount : 0,
        total_amount: input.totalAmount,
        quantity: "1",
        // Jewelry is small and light — adjust these defaults in the Delhivery
        // dashboard per-shipment if a particular order needs different packaging.
        weight: "200",
        shipment_width: "10",
        shipment_height: "5",
        shipment_length: "10",
        waybill: "",
      },
    ],
    pickup_location: { name: DELHIVERY_PICKUP_LOCATION },
  };

  try {
    const res = await fetch(`${DELHIVERY_BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Token ${DELHIVERY_API_TOKEN}`,
      },
      body: `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`,
    });

    const data = await res.json().catch(() => null);
    const pkg = data?.packages?.[0];

    if (pkg?.waybill && pkg?.status !== "Fail") {
      return { ok: true, waybill: pkg.waybill };
    }

    const errorMessage =
      (Array.isArray(pkg?.remarks) ? pkg.remarks.join(", ") : pkg?.remarks) ||
      data?.rmk ||
      `Delhivery rejected the shipment (HTTP ${res.status})`;
    return { ok: false, error: errorMessage };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error contacting Delhivery",
    };
  }
}
