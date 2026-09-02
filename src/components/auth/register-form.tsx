"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

type Role = "renter" | "agent" | "artisan";

const ROLES: { value: Role; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    value: "renter",
    label: "Renter",
    sub: "Looking for a room or apartment",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    value: "agent",
    label: "Agent",
    sub: "List and manage properties",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: "artisan",
    label: "Artisan",
    sub: "Offer home services & repairs",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
];

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-primary" },
    { label: "Very strong", color: "bg-primary" },
  ];
  return { score, ...map[score] };
}

function RegisterFormInner() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [trade, setTrade] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  function handleSelectRole(selected: Role) {
    setRole(selected);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...(role === "agent" && { business_name: businessName }),
          ...(role === "artisan" && { trade }),
        },
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push(`/${role}/dashboard`);
  }

  async function handleGoogleSignUp() {
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className="w-full">
      <Link prefetch={false} href="/" className="inline-flex lg:hidden mb-8 font-extrabold text-xl text-heading">
        <Logo className="h-8 w-auto" />
      </Link>

      <div className="mb-8 flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= s ? "bg-primary text-white" : "bg-border text-body/50"
              }`}>
              {step > s ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : s}
            </div>
            {s < 2 && <div className={`h-px w-8 transition-all ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-1 text-xs text-body/50">
          {step === 1 ? "Choose your role" : "Your details"}
        </span>
      </div>

      {step === 1 && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-heading">Join DirectRent GH</h1>
            <p className="mt-2 text-sm text-body/70">How will you be using the platform?</p>
          </div>

          <button
            type="button"
            id="register-google-btn"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-heading shadow-sm transition hover:border-primary/40 hover:bg-mint/10 hover:shadow-md active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-body/50 font-medium uppercase tracking-widest">or pick a role</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <div className="flex flex-col gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value}`}
                onClick={() => handleSelectRole(r.value)}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition hover:border-primary/50 hover:bg-mint/10 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/30 text-primary transition group-hover:bg-primary group-hover:text-white">
                  {r.icon}
                </div>
                <div>
                  <p className="font-semibold text-heading">{r.label}</p>
                  <p className="text-xs text-body/60 mt-0.5">{r.sub}</p>
                </div>
                <svg className="ml-auto h-4 w-4 shrink-0 text-body/30 transition group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}

          <p className="mt-8 text-center text-sm text-body/60">
            Already have an account?{" "}
            <Link prefetch={false} href="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition" replace>
              Log in
            </Link>
          </p>
        </>
      )}

      {step === 2 && role && (
        <>
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 flex items-center gap-1.5 text-sm text-body/60 hover:text-heading transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-heading capitalize">Sign up as {role}</h1>
            <p className="mt-2 text-sm text-body/70">Fill in your details to create your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                Full name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Kofi Asante"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-11 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-body/40 hover:text-body transition"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.color : "bg-border"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-body/50 shrink-0">{strength.label}</span>
                </div>
              )}
            </div>

            {role === "agent" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-business" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                  Business name
                </label>
                <input
                  id="reg-business"
                  type="text"
                  required
                  placeholder="e.g. Asante Properties"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {role === "artisan" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-trade" className="text-xs font-semibold uppercase tracking-[0.18em] text-body/60">
                  Trade / Speciality
                </label>
                <input
                  id="reg-trade"
                  type="text"
                  required
                  placeholder="e.g. Electrician, Carpenter…"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-heading placeholder:text-body/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <label htmlFor="reg-terms" className="flex items-start gap-3 cursor-pointer select-none group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  id="reg-terms"
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-5 w-5 rounded-md border border-border bg-card transition peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/60" />
                <svg
                  className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-sm text-body/70 leading-5">
                I agree to the{" "}
                <Link prefetch={false} href="/terms" className="text-primary hover:text-primary-hover transition font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link prefetch={false} href="/privacy-policy" className="text-primary hover:text-primary-hover transition font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              id="register-submit-btn"
              disabled={submitting}
              className="mt-1 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-body/60">
            Already have an account?{" "}
            <Link prefetch={false} href="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition" replace>
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RegisterFormInner />
    </Suspense>
  );
}
