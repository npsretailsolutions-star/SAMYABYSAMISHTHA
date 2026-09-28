import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";

export const metadata = { title: "Return, Exchange & Cancellation Policy | Samya By Samishtha" };

export default function ReturnExchangePolicyPage() {
  return (
    <PolicyPage
      title="Return, Exchange & Cancellation Policy"
      intro="This policy applies to all purchases made through the official website of Samya by Samishtha. By placing an order, you agree to the terms mentioned below. Please read them carefully before making a purchase."
    >
      <PolicySection number="1" title="Return & Exchange Window">
        <p>You may request a return or exchange within 3 days from the date of delivery.</p>
        <p>To be eligible:</p>
        <PolicyList
          items={[
            "The item must be unused, unworn, and in its original condition.",
            "All original tags, packaging, invoices, and accessories must be intact.",
            "Products showing signs of wear, scratches, perfume exposure, makeup stains, damage, or alteration will not qualify for return or exchange.",
          ]}
        />
      </PolicySection>

      <PolicySection number="2" title="Return & Exchange Options">
        <p className="font-medium text-brand-teal">Return for Refund</p>
        <p>Eligible products may be returned for a refund to the original payment method.</p>
        <p className="font-medium text-brand-teal">Exchange</p>
        <p>You may exchange your product for:</p>
        <PolicyList
          items={["Another design", "Different size", "Different colour", "Another item of equal or higher value"]}
        />
        <p className="text-xs text-brand-teal/60">
          (Price difference, if applicable, will be adjusted accordingly.)
        </p>
        <p className="font-medium text-brand-teal">Exchange Benefit</p>
        <p>
          For exchange requests within India, we may provide complimentary return
          pickup or return shipping support in eligible service areas.
        </p>
      </PolicySection>

      <PolicySection number="3" title="How to Request a Return or Exchange">
        <p>Please contact us within 3 days of delivery through:</p>
        <p>Email: care@samyabysamishtha.com</p>
        <p>Kindly share:</p>
        <PolicyList
          items={["Order number", "Reason for return/exchange", "Clear photos of the product, packaging, and tags"]}
        />
        <p>
          Our team usually reviews requests within 24–48 business hours and will
          provide further instructions. Depending on service availability, we
          may:
        </p>
        <PolicyList items={["Arrange a pickup, or", "Request self-shipping of the product"]} />
        <p>
          If self-shipping is requested, customers are advised to keep the
          courier receipt safely until the process is completed.
        </p>
      </PolicySection>

      <PolicySection number="4" title="Refund Process">
        <p>
          Once the returned item is received and passes quality inspection at our
          facility, refunds are processed within 5–10 business days to the
          original payment method.
        </p>
        <p>Refund methods may include:</p>
        <PolicyList
          items={["Credit/Debit Card", "UPI", "Net Banking", "Wallets", "Bank Transfer (for eligible COD orders)"]}
        />
        <p className="font-medium text-brand-teal">Important Notes</p>
        <PolicyList
          items={[
            "Refund processing begins only after successful inspection of the returned product.",
            "For Cash on Delivery (COD) orders, refunds are processed via bank transfer or UPI to the customer's registered details.",
            "If an order qualified for free shipping, the original shipping charge (if applicable) may be deducted from the refundable amount.",
          ]}
        />
      </PolicySection>

      <PolicySection number="5" title="Cancellation Policy">
        <p>Orders can only be cancelled before dispatch.</p>
        <p>
          Once an order has been shipped, it cannot be cancelled and will fall
          under the Return &amp; Exchange Policy.
        </p>
      </PolicySection>

      <PolicySection number="6" title="Non-Returnable & Non-Exchangeable Items">
        <p>
          Due to hygiene, safety, and product nature, the following items are not
          eligible for return or exchange:
        </p>
        <PolicyList
          items={[
            "Earrings and worn jewellery items",
            "Used or damaged products",
            "Customised or personalised jewellery",
            "Made-to-order items",
            "Sale, clearance, or final sale products",
            "Products damaged due to misuse, improper handling, exposure to moisture, perfume, chemicals, or normal wear and tear",
          ]}
        />
      </PolicySection>

      <PolicySection number="7" title="Damaged, Defective or Wrong Items">
        <p>If you receive:</p>
        <PolicyList items={["A damaged product", "A defective item", "A wrong product", "Missing items or accessories"]} />
        <p>Please contact us within 3 days of delivery with:</p>
        <PolicyList items={["Your order number", "Clear photos/videos", "Packaging images"]} />
        <p className="font-medium text-brand-teal">Important</p>
        <p>
          An unboxing video recorded from the beginning of opening the package is
          mandatory for claims related to:
        </p>
        <PolicyList items={["Missing products", "Wrong items", "Transit damage", "Empty parcel claims"]} />
        <p>After verification, we may offer:</p>
        <PolicyList items={["Replacement", "Store credit", "Refund"]} />
        <p className="text-xs text-brand-teal/60">
          depending on stock availability and issue verification.
        </p>
      </PolicySection>

      <PolicySection number="8" title="Product Appearance Disclaimer">
        <p>Slight variations in colour, texture, shine, or finish may occur due to:</p>
        <PolicyList items={["Photography lighting", "Mobile/computer screen settings", "Handcrafted detailing"]} />
        <p>Such minor variations are natural and shall not be considered defects.</p>
      </PolicySection>

      <PolicySection number="9" title="Exchange Processing Time">
        <p>
          Approved exchange orders are generally processed within 5–7 business
          days after the returned item is received and approved.
        </p>
      </PolicySection>

      <PolicySection number="10" title="General Conditions">
        <PolicyList
          items={[
            "All returns and exchanges are subject to quality inspection.",
            "We reserve the right to reject claims that do not meet our policy conditions.",
            "Return/exchange approval is solely at the discretion of Samya by Samishtha after inspection and verification.",
          ]}
        />
        <p>
          As a small handcrafted jewellery brand, every piece is carefully
          created and packed with attention to detail. These policies help us
          maintain fairness, quality, and a smooth experience for all customers.
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>
          For support, sizing help, exchange assistance, or product-related
          queries:
        </p>
        <p>Email: care@samyabysamishtha.com</p>
        <p>WhatsApp: +91-8076621656 (Only for Chat)</p>
        <p>Customer Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM IST</p>
      </PolicySection>
    </PolicyPage>
  );
}
