"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: once Supabase is set up, this becomes:
    //   await supabase.auth.resetPasswordForEmail(email, { redirectTo: ".../auth/reset-password" })
    console.log({ email });
    setSubmitted(true);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-bold text-center">Forgot password</h1>

        {submitted ? (
          <p className="font-supporting text-sm text-body text-center">
            If an account exists for <strong>{email}</strong>, a password reset
            link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="font-supporting text-sm text-body">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-semibold text-sm mt-2"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="text-center text-sm font-supporting text-body">
          <Link href="/auth/login" className="text-primary font-semibold">
            ← Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
