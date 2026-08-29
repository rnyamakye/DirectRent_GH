"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);



  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        setRole(profile?.role ?? null);
      }
    }
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setRole(profile?.role ?? null);
      } else {
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Do not show footer on messaging pages
  if (pathname?.includes("/messages")) {
    return null;
  }

  let footerLinks = [];

  if (role === "agent" || role === "artisan") {
    footerLinks = [
      {
        heading: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ];
  } else {
    footerLinks = [
      ...(user ? [{
        heading: "Explore",
        links: [
          { label: "Properties", href: "/listings" },
          { label: "Artisans", href: "/artisans" },
          { label: "Agents", href: "/agents" },
        ],
      }] : []),
      {
        heading: "Account",
        links: user ? [
          { label: "Dashboard", href: role ? `/${role}/dashboard` : "/auth/select-role" },
          { label: "My Profile", href: role ? `/${role}/profile` : "/auth/select-role" },
        ] : [
          { label: "Log In", href: "/auth/login" },
          { label: "Register", href: "/auth/register" },
          { label: "Join as Professional", href: "/auth/register?role=professional" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ];
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-[#0e1a14] text-white/70 relative -bottom-25">
      {/* ── Newsletter banner ── */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#4ade80]">
                Stay in the loop
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Get the latest listings &amp; news
              </h2>
              <p className="mt-1 text-sm text-white/55">
                New properties and artisan spotlights delivered to your inbox.
              </p>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#4ade80]/30 bg-[#4ade80]/10 px-6 py-4">
                <svg
                  className="h-5 w-5 text-[#4ade80]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span className="text-sm font-semibold text-[#4ade80]">
                  You&apos;re subscribed — thanks!
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                aria-label="Newsletter subscription form"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#4ade80]/60 focus:ring-2 focus:ring-[#4ade80]/20 disabled:opacity-50"
                  disabled={loading}
                />
                <button
                  type="submit"
                  id="newsletter-subscribe-btn"
                  disabled={loading}
                  className="shrink-0 rounded-xl bg-[#0f5c3a] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#1a8a5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main link columns ── */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="inline-block text-xl font-extrabold tracking-tight text-white transition hover:text-[#4ade80]"
            >
              DirectRent<span className="text-[#4ade80]"> GH</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">
              Ghana&apos;s trusted platform for finding rooms, apartments, and
              skilled artisans — all in one place.
            </p>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-[#4ade80]/40 hover:bg-[#4ade80]/10 hover:text-[#4ade80]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} DirectRent GH. All rights reserved.
          </p>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Legal links">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Policy", href: "/cookies" },
              { label: "Sitemap", href: "/sitemap.xml" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-white/40 transition hover:text-white/80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
