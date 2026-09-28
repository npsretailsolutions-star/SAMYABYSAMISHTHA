import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";

export const metadata = { title: "Shipping Policy | Samya By Samishtha" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      intro="This Shipping Policy applies to all orders placed through the official website of Samya by Samishtha. By placing an order, you agree to the terms mentioned below."
    >
      <PolicySection number="1" title="Shipping Locations">
        <p>We currently ship across most cities and towns within India.</p>
        <p>
          Delivery availability depends on courier serviceability in your area.
          Customers can check service availability by entering their PIN code
          during checkout or on the product page.
        </p>
        <p>
          If your location is not serviceable due to logistical limitations, we
          will notify you promptly and process a refund if applicable.
        </p>
        <p>At present, we do not offer international shipping.</p>
      </PolicySection>

      <PolicySection number="2" title="Order Processing Time">
        <p>All jewellery pieces are carefully packed and dispatched from our warehouse in Delhi.</p>
        <p className="font-medium text-brand-teal">Processing Time</p>
        <PolicyList
          items={[
            "Orders are usually processed and dispatched within 1–2 business days",
            "Business days: Monday to Saturday (excluding public holidays)",
          ]}
        />
        <p>
          During high-demand periods, festive seasons, sales, or unforeseen
          circumstances, processing may take slightly longer. In such cases,
          customers will be informed via email, SMS, or WhatsApp.
        </p>
        <p>Once dispatched, you will receive shipping confirmation along with tracking details.</p>
      </PolicySection>

      <PolicySection number="3" title="Delivery Timelines">
        <p>We work with trusted logistics partners such as:</p>
        <PolicyList items={["Delhivery", "Blue Dart", "DTDC", "Other reputed courier partners"]} />
        <p className="font-medium text-brand-teal">Estimated Delivery Time</p>
        <PolicyList
          items={[
            "Metro cities: Approximately 3–5 business days",
            "Other cities/towns: Approximately 4–7 business days",
            "Remote locations may require additional time depending on courier accessibility",
          ]}
        />
        <p>Delivery timelines are estimates and may vary due to:</p>
        <PolicyList
          items={[
            "Weather conditions",
            "Public holidays",
            "Festivals",
            "Operational delays",
            "Courier disruptions",
            "High shipment volumes",
          ]}
        />
        <p>
          While we strive for timely delivery, delays caused by external
          logistics partners are beyond our direct control.
        </p>
      </PolicySection>

      <PolicySection number="4" title="Shipping Charges">
        <p className="font-medium text-brand-teal">Free Shipping</p>
        <p>We offer free standard shipping on prepaid orders above ₹549 within India.</p>
        <p className="font-medium text-brand-teal">Standard Shipping Charges</p>
        <p>
          For orders below ₹549, shipping charges are calculated at checkout
          based on order value and delivery location.
        </p>
        <p className="font-medium text-brand-teal">Cash on Delivery (COD)</p>
        <p>COD may be available for selected PIN codes and eligible orders.</p>
        <p>
          We reserve the right to disable COD for certain high-risk locations or
          repeated non-delivery cases.
        </p>
      </PolicySection>

      <PolicySection number="5" title="Order Tracking">
        <p>Once your order is dispatched:</p>
        <PolicyList
          items={[
            "A tracking link and tracking number will be shared via email and/or SMS",
            "Customers can track their shipment directly through the courier partner's website",
            "Registered users may also track order status through their account on our website",
          ]}
        />
        <p>Tracking updates may take up to 24 hours to reflect after dispatch.</p>
      </PolicySection>

      <PolicySection number="6" title="Delivery & Packaging">
        <p>We take special care in packaging jewellery products to ensure safe delivery.</p>
        <p className="font-medium text-brand-teal">Packaging Includes</p>
        <PolicyList
          items={[
            "Secure protective packaging",
            "Bubble wrap where required",
            "Jewellery-safe storage packaging",
            "Protective pouches for applicable items",
          ]}
        />
        <p className="font-medium text-brand-teal">Upon Delivery</p>
        <p>Please inspect the package carefully at the time of delivery. If the package appears:</p>
        <PolicyList items={["Tampered", "Opened", "Damaged"]} />
        <p>
          Please refuse delivery (if possible) and contact us immediately with
          photos/videos. For claims related to transit damage, wrong items, or
          missing products, an unboxing video recorded from the beginning of
          opening the package may be required.
        </p>
      </PolicySection>

      <PolicySection number="7" title="Failed Delivery Attempts">
        <p>
          Customers are requested to provide accurate delivery details and
          ensure availability at the time of delivery. If:
        </p>
        <PolicyList
          items={[
            "Delivery attempts fail repeatedly,",
            "The package is refused,",
            "Incorrect address/contact details are provided,",
          ]}
        />
        <p>additional shipping or re-delivery charges may apply.</p>
        <p>
          Orders returned to us due to failed delivery attempts may be cancelled
          at our discretion.
        </p>
      </PolicySection>

      <PolicySection number="8" title="Cancellation Policy">
        <p>Orders may only be cancelled before dispatch.</p>
        <p>
          Once shipped, orders cannot be cancelled and will be governed under our
          Return &amp; Exchange Policy.
        </p>
        <p>To request cancellation, please contact us immediately after placing the order.</p>
      </PolicySection>

      <PolicySection number="9" title="Important Notes">
        <PolicyList
          items={[
            "We currently do not ship internationally.",
            "Delivery timelines are estimates and not guaranteed delivery commitments.",
            "We are not responsible for delays caused by natural events, strikes, courier disruptions, government restrictions, or other external factors beyond our control.",
            "A single order cannot currently be split across multiple delivery addresses.",
          ]}
        />
      </PolicySection>

      <PolicySection number="10" title="Contact Us">
        <p>For shipping support, tracking assistance, or delivery-related queries:</p>
        <p>Email: care@samyabysamishtha.com</p>
        <p>Customer Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM IST</p>
      </PolicySection>
    </PolicyPage>
  );
}
