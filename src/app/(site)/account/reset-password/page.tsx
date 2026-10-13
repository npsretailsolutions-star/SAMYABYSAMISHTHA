"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/customer/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Could not reset password.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="container-px mx-auto section-y max-w-md">
      <h1 className="font-serif text-2xl font-semibold text-brand-teal text-center mb-6">
        Set a New Password
      </h1>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        {done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
              Your password has been updated.
            </p>
            <Link href="/account/login" className="btn-gold w-full">
              Login
            </Link>
          </div>
        ) : !email || !token ? (
          <p className="text-sm text-red-600">
            This reset link is incomplete.{" "}
            <Link href="/account/forgot-password" className="underline">
              Request a new one
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {[
              ["New Password", password, setPassword],
              ["Confirm Password", confirm, setConfirm],
            ].map(([label, value, set]) => (
              <div key={label as string}>
                <label className="block text-sm font-medium text-brand-teal mb-1">
                  {label as string}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={value as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>
            ))}
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? "Saving..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
