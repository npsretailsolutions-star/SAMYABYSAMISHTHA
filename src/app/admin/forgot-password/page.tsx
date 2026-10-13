"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Please enter a valid email address.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-gradient px-4">
      <div className="w-full max-w-md">
      <h1 className="font-serif text-2xl font-semibold text-brand-cream text-center mb-2">
        Admin Forgot Password
      </h1>
      <p className="text-sm text-brand-cream/70 text-center mb-6">
        Enter your admin email and we&apos;ll send a link to set a new password.
      </p>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        {sent ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
            If an account exists for {email}, a reset link is on its way. Please check your inbox
            (and spam folder). The link is valid for 1 hour.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-teal mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/login" className="text-brand-gold-dark hover:underline">
            Back to login
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
