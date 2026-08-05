"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    // TODO: once Supabase is set up, this becomes:
    //   await supabase.auth.updateUser({ password })
    console.log({ token, password });
    router.push("/auth/login?reset=success");
  }

  if (!token) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <p className="font-supporting text-sm text-body">
          This reset link is invalid or has expired.{" "}
          <Link
            href="/auth/forgot-password"
            className="text-primary font-semibold"
          >
            Request a new one
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-bold text-center">Reset your password</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
          />

          {error && (
            <p className="text-xs font-supporting text-accent">{error}</p>
          )}

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-semibold text-sm mt-2"
          >
            Reset password
          </button>
        </form>
      </div>
    </main>
  );
}
