import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Contact Us | Samya By Samishtha" };

export default function ContactPage() {
  return (
    <div className="container-px mx-auto section-y max-w-2xl text-center">
      <span className="eyebrow">Get in Touch</span>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal mb-8">
        Contact Us
      </h1>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Mail size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">Email</p>
          <p className="text-sm text-brand-teal/70 mt-1">hello@samyabysamishtha.com</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Phone size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">Phone</p>
          <p className="text-sm text-brand-teal/70 mt-1">+91 98765 43210</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <MapPin size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">Location</p>
          <p className="text-sm text-brand-teal/70 mt-1">India</p>
        </div>
      </div>
    </div>
  );
}
