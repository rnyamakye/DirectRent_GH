"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Link from "next/link";
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-heading">{title}</h2>
        {subtitle && <p className="text-sm text-body/70 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card";

export default function LoginSecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEmailProvider, setIsEmailProvider] = useState(false);
  const [isGoogleProvider, setIsGoogleProvider] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Deactivate state
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Sessions (placeholder data)
  const sessions = [
    { device: "Chrome on Windows", location: "Accra, Ghana", current: true, time: "Now" },
    { device: "Safari on iPhone", location: "Kumasi, Ghana", current: false, time: "2 days ago" },
  ];

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const providers = user.app_metadata?.providers ?? [user.app_metadata?.provider];
      setIsEmailProvider(providers.includes("email"));
      setIsGoogleProvider(providers.includes("google"));
      setLoading(false);
    }
    load();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match."); return; }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSuccess(true);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPwSuccess(false), 3000);
  }

  async function handleDeactivate() {
    setDeactivating(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } else {
      setDeactivating(false);
      setDeactivateOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Login &amp; security</h1>
          <p className="text-sm text-body/70 mt-0.5">Manage your password, connected accounts and active sessions.</p>
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full">

      {/* Change password */}
      {isEmailProvider && (
        <Section title="Change password" subtitle="Choose a strong password you don't use elsewhere.">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-heading">Current password</label>
              <input className={INPUT} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">New password</label>
                <input className={INPUT} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">Confirm new password</label>
                <input className={INPUT} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
              </div>
            </div>
            {pwError && <p className="text-sm text-accent font-semibold">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-green-600 font-semibold">Password updated successfully ✓</p>}
            <div>
              <button type="submit" disabled={pwSaving} className="rounded-full bg-primary hover:bg-primary-hover text-white px-6 py-2.5 text-sm font-bold transition disabled:opacity-50">
                {pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </Section>
      )}

      {/* Connected accounts */}
      <Section title="Connected accounts" subtitle="Accounts you've linked for signing in.">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {/* Google logo */}
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">Google</p>
              <p className="text-xs text-body/60">{isGoogleProvider ? "Connected" : "Not connected"}</p>
            </div>
          </div>
          {isGoogleProvider ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Connected
            </span>
          ) : (
            <span className="text-xs text-body/50 font-medium">Not connected</span>
          )}
        </div>
      </Section>

      {/* Active sessions */}
      <Section title="Active sessions" subtitle="Devices currently signed in to your account.">
        <div className="flex flex-col divide-y divide-border">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-heading">{s.device}</p>
                  <p className="text-xs text-body/60">{s.location} · {s.time}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">This device</span>
              ) : (
                <button className="text-xs text-body/60 hover:text-accent font-semibold transition">Sign out</button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Deactivate account */}
      <Section title="Deactivate account" subtitle="Permanently delete your account and all associated data. This cannot be undone.">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-body/80">Once deactivated, your profile, saved listings and reviews will be permanently removed.</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setDeactivateOpen(true)}
            className="rounded-full border-2 border-accent/30 text-accent hover:bg-accent/5 hover:border-accent px-6 py-2.5 text-sm font-bold transition"
          >
            Deactivate my account
          </button>
        </div>
      </Section>

      <ConfirmationModal
        isOpen={deactivateOpen}
        title="Deactivate account"
        message="Are you sure you want to permanently deactivate your account? This action cannot be undone and all your data will be deleted."
        confirmText="Yes, deactivate"
        cancelText="Keep my account"
        isDestructive
        isLoading={deactivating}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateOpen(false)}
      />
      </div>
    </div>
  );
}
