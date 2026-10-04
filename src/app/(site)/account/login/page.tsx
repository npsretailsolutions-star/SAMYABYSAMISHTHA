"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomer } from "@/components/CustomerProvider";

export default function AccountLoginPage() {
  return (
    <Suspense fallback={null}>
      <AccountLoginForm />
    </Suspense>
  );
}

function AccountLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCustomer();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const redirectTo = searchParams.get("redirect") || "/account";

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not log in.");
      setSubmitting(false);
      return;
    }
    await refresh();
    router.push(redirectTo);
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/customer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create account.");
      setSubmitting(false);
      return;
    }
    await refresh();
    router.push(redirectTo);
  };

  return (
    <div className="container-px mx-auto section-y max-w-md">
      <div className="text-center mb-8">
        <span className="eyebrow">Welcome</span>
        <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
          {mode === "login" ? "Login to Your Account" : "Create an Account"}
        </h1>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-6 flex rounded-full bg-brand-teal/5 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              mode === "login" ? "bg-brand-teal text-brand-cream" : "text-brand-teal/60"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              mode === "register" ? "bg-brand-teal text-brand-cream" : "text-brand-teal/60"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        {mode === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(v) => setLoginForm((f) => ({ ...f, email: v }))}
            />
            <Field
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(v) => setLoginForm((f) => ({ ...f, password: v }))}
            />
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <Field
              label="Full Name"
              value={registerForm.name}
              onChange={(v) => setRegisterForm((f) => ({ ...f, name: v }))}
            />
            <Field
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(v) => setRegisterForm((f) => ({ ...f, email: v }))}
            />
            <Field
              label="Phone"
              type="tel"
              value={registerForm.phone}
              onChange={(v) => setRegisterForm((f) => ({ ...f, phone: v }))}
            />
            <Field
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(v) => setRegisterForm((f) => ({ ...f, password: v }))}
            />
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-brand-teal/50">
        By continuing, you agree to our{" "}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-teal mb-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
    </div>
  );
}
