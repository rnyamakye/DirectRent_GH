"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    
    if (resetError) {
      setError(resetError.message);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-canvas rounded-2xl shadow-xl border border-border p-6 md:p-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex lg:hidden mb-8 font-extrabold text-xl text-heading">
            DirectRent<span className="text-primary"> GH</span>
          </Link>
          <h1 className="text-3xl font-bold text-heading">Forgot password</h1>
          <p className="mt-2 text-sm text-body/70">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 text-primary mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-body/80 mb-2">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
            </p>
            <p className="text-xs text-body/60">
              Please check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-body/60">
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition" replace>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
