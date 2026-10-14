"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (!res.ok) {
        setError("Please enter a valid email address");
        return;
      }
      try {
        localStorage.setItem("sbs_welcome_subscribed", "1");
      } catch {
        // ignore
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? "Please wait..." : "Subscribe"}
            </button>
          </form>
        )}
        {error && !submitted && (
          <p className="mt-3 text-xs text-red-300">{error}</p>
        )}
      </div>
    </section>
  );
}
