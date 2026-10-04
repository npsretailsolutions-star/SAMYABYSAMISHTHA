import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 21c1-3 2-7 2.5-9.5M12 12a3 3 0 1 0-3-3c0 1 .3 1.8.8 2.3M12 12c0 2.5 1 4 2.5 4 2 0 3.5-2 3.5-5a4 4 0 0 0-4.2-4" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-teal-gradient text-brand-cream mt-16">
      <div className="container-px mx-auto grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Image
            src="/images/logo-gold.svg"
            alt="Samya By Samishtha"
            width={190}
            height={76}
            className="h-16 w-auto object-contain mb-4"
          />
          <p className="text-sm text-brand-cream/70 leading-relaxed">
            Premium artificial & fashion jewellery, handcrafted for everyday
            elegance and festive celebration.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href="https://www.instagram.com/samyabysamishtha/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/30 hover:bg-brand-gold hover:text-brand-teal-dark hover:border-brand-gold transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/share/1Ec6tfy2MU/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/30 hover:bg-brand-gold hover:text-brand-teal-dark hover:border-brand-gold transition-colors"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://pin.it/cJZUqu5F9"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/30 hover:bg-brand-gold hover:text-brand-teal-dark hover:border-brand-gold transition-colors"
            >
              <PinterestIcon />
            </a>
            <a
              href="https://www.youtube.com/@SAMYABYSAMISHTHA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/30 hover:bg-brand-gold hover:text-brand-teal-dark hover:border-brand-gold transition-colors"
            >
              <YoutubeIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-brand-gold-light mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-brand-cream/80">
            <li><Link href="/shop/necklaces" className="hover:text-brand-gold-light">Necklaces</Link></li>
            <li><Link href="/shop/earrings" className="hover:text-brand-gold-light">Earrings</Link></li>
            <li><Link href="/shop/bangles" className="hover:text-brand-gold-light">Bangles</Link></li>
            <li><Link href="/shop/bracelets" className="hover:text-brand-gold-light">Bracelets</Link></li>
            <li><Link href="/shop/pendants" className="hover:text-brand-gold-light">Pendants</Link></li>
            <li><Link href="/shop/gifting" className="hover:text-brand-gold-light">Gifting</Link></li>
            <li><Link href="/build-your-gift" className="hover:text-brand-gold-light">Build Your Own Gift Set</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-brand-gold-light mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-brand-cream/80">
            <li><Link href="/about" className="hover:text-brand-gold-light">About Us</Link></li>
            <li><Link href="/shop" className="hover:text-brand-gold-light">Shop All</Link></li>
            <li><Link href="/blog" className="hover:text-brand-gold-light">Journal</Link></li>
            <li><Link href="/contact" className="hover:text-brand-gold-light">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-brand-gold-light mb-4">Policies</h4>
          <ul className="space-y-2 text-sm text-brand-cream/80">
            <li><Link href="/track-order" className="hover:text-brand-gold-light">Track Your Order</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-brand-gold-light">Shipping Policy</Link></li>
            <li><Link href="/return-exchange-policy" className="hover:text-brand-gold-light">Return, Exchange &amp; Cancellation</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-gold-light">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-brand-gold-light mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-brand-cream/80">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-brand-gold-light shrink-0" />
              <span>care@samyabysamishtha.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand-gold-light shrink-0" />
              <span>+91 80766 21656</span>
            </li>
            <li className="text-xs text-brand-cream/60">
              Mon–Sat, 10:00 AM – 6:00 PM IST
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-cream/10 py-5">
        <p className="text-center text-xs text-brand-cream/60 container-px">
          © {new Date().getFullYear()} Samya By Samishtha. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
