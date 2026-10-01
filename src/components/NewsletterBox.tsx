"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-teal-gradient">
      <div className="container-px mx-auto py-12 sm:py-14 text-center">
        <Mail size={26} className="mx-auto text-brand-gold-light mb-3" />
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-brand-cream">
          Stay In Touch
        </h2>
        <p className="mt-1 text-sm text-brand-cream/70">
          Get exclusive offers, new arrivals and more.
        </p>
        {submitted ? (
          <p className="mt-6 text-sm font-medium text-brand-gold-light">
            Thanks! We&apos;ll keep you posted.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-6 mx-auto flex max-w-md flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-full border border-brand-cream/20 bg-white px-5 py-3 text-sm text-brand-teal placeholder:text-brand-teal/40 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <button type="submit" className="btn-gold">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
