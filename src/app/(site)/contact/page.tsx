import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Contact Us | Samya By Samishtha" };

export default function ContactPage() {
  return (
    <div className="container-px mx-auto section-y max-w-2xl text-center">
      <span className="eyebrow">Get in Touch</span>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal mb-3">
        Contact Us
      </h1>
      <p className="text-sm text-brand-teal/60 mb-8">
        Customer Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM IST
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Mail size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">Email</p>
          <p className="text-sm text-brand-teal/70 mt-1">care@samyabysamishtha.com</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <Phone size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">WhatsApp</p>
          <p className="text-sm text-brand-teal/70 mt-1">+91 80766 21656</p>
          <p className="text-xs text-brand-teal/50 mt-0.5">Chat only</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <MapPin size={22} className="mx-auto text-brand-gold-dark mb-3" />
          <p className="text-sm font-medium text-brand-teal">Location</p>
          <p className="text-sm text-brand-teal/70 mt-1">Delhi, India</p>
        </div>
      </div>
    </div>
  );
}
