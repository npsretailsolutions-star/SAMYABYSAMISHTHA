import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";

export const metadata = { title: "Privacy Policy | Samya By Samishtha" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="This Privacy Policy describes how Samya by Samishtha collects, uses, stores, and protects your personal information when you use our website, place an order, or interact with our services. By accessing or using our website, you agree to the terms of this Privacy Policy."
    >
      <PolicySection number="1" title="Information We Collect">
        <p>
          To provide a smooth and secure shopping experience, we may collect the
          following information:
        </p>
        <p className="font-medium text-brand-teal">Personal Information</p>
        <p>Information you voluntarily provide, including:</p>
        <PolicyList
          items={[
            "Full name",
            "Email address",
            "Mobile number",
            "Shipping and billing address",
            "Order details",
            "Messages, feedback, or customer support queries",
          ]}
        />
        <p className="font-medium text-brand-teal">Payment Information</p>
        <p>
          Payments are processed securely through trusted third-party payment
          gateways. We do not store:
        </p>
        <PolicyList items={["Full card numbers", "CVV details", "Banking passwords"]} />
        <p className="font-medium text-brand-teal">Automatically Collected Information</p>
        <p>
          When you visit our website, certain information may be collected
          automatically, such as:
        </p>
        <PolicyList
          items={[
            "IP address",
            "Browser type",
            "Device information",
            "Pages visited",
            "Time spent on the website",
            "Referral source",
            "Approximate location information",
          ]}
        />
        <p className="font-medium text-brand-teal">Cookies &amp; Tracking Technologies</p>
        <p>We may use cookies and similar technologies to:</p>
        <PolicyList
          items={[
            "Improve website functionality",
            "Remember cart and login details",
            "Understand customer preferences",
            "Improve user experience and marketing performance",
          ]}
        />
        <p>
          You may disable cookies through your browser settings, though some
          website features may not function properly.
        </p>
      </PolicySection>

      <PolicySection number="2" title="How We Use Your Information">
        <p>We use collected information for legitimate business purposes, including:</p>
        <PolicyList
          items={[
            "Processing and delivering orders",
            "Sending order confirmations and shipping updates",
            "Providing customer support",
            "Improving website performance and user experience",
            "Preventing fraud and misuse",
            "Responding to inquiries or disputes",
            "Sending promotional emails, offers, or updates (only where permitted)",
          ]}
        />
        <p>
          We only use your information to the extent necessary for operating our
          business and serving customers effectively.
        </p>
      </PolicySection>

      <PolicySection number="3" title="Sharing of Information">
        <p>
          We respect your privacy and do not sell or rent your personal
          information to third parties. Your information may be shared only with
          trusted service providers such as:
        </p>
        <PolicyList
          items={[
            "Payment gateways",
            "Shipping and logistics partners",
            "Technology and website service providers",
            "Customer communication platforms",
          ]}
        />
        <p>
          These parties receive only the information necessary to perform their
          services and are expected to maintain confidentiality and security
          standards. We may also disclose information if required by law, legal
          process, or government authority.
        </p>
      </PolicySection>

      <PolicySection number="4" title="Data Security">
        <p>We take reasonable security measures to protect your personal information, including:</p>
        <PolicyList
          items={[
            "Secure encrypted connections (SSL)",
            "Restricted access to sensitive data",
            "Secure payment gateway integrations",
            "Regular monitoring for unauthorized access",
          ]}
        />
        <p>
          While we strive to protect your information, no online transmission or
          storage method can be guaranteed to be completely secure.
        </p>
      </PolicySection>

      <PolicySection number="5" title="Marketing Communications">
        <p>With your permission, we may send:</p>
        <PolicyList
          items={["Product launches", "Offers and discounts", "Collection updates", "Promotional messages"]}
        />
        <p>
          You may unsubscribe from marketing communications at any time using the
          unsubscribe option in emails or by contacting us directly.
        </p>
      </PolicySection>

      <PolicySection number="6" title="Third-Party Services">
        <p>Our website may contain links or integrations with third-party services such as:</p>
        <PolicyList
          items={["Payment gateways", "Courier tracking systems", "Social media platforms", "Analytics tools"]}
        />
        <p>
          We are not responsible for the privacy practices or content of
          third-party platforms.
        </p>
      </PolicySection>

      <PolicySection number="7" title="Children's Privacy">
        <p>
          Our website is intended for users above 18 years of age or users
          accessing the website under parental supervision. We do not knowingly
          collect personal information from children.
        </p>
      </PolicySection>

      <PolicySection number="8" title="Policy Updates">
        <p>
          We may update this Privacy Policy from time to time to reflect
          operational, legal, or regulatory changes. Updated versions will be
          posted on this page with the revised effective date. Continued use of
          our website after changes implies acceptance of the updated policy.
        </p>
      </PolicySection>

      <PolicySection number="9" title="Contact Us">
        <p>
          If you have questions, concerns, or requests regarding this Privacy
          Policy, please contact us:
        </p>
        <p>Email: care@samyabysamishtha.com</p>
        <p>Customer Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM IST</p>
        <p className="pt-2 italic">
          Thank you for trusting Samya by Samishtha. We value your privacy and are
          committed to protecting your information responsibly.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
