"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-heading">{label}</label>
      {hint && <p className="text-xs text-body/60">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT =
  "w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card";

export default function AgentPersonalInformationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, preferred_name, phone, residential_address, emergency_contact_name, emergency_contact_phone")
        .eq("id", user.id)
        .single();

      if (p) {
        const parts = (p.full_name ?? "").split(" ");
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" ") ?? "");
        setPreferredName(p.preferred_name ?? "");
        setPhone(p.phone ?? "");
        setAddress(p.residential_address ?? "");
        setEcName(p.emergency_contact_name ?? "");
        setEcPhone(p.emergency_contact_phone ?? "");
      }
      setEmail(user.email ?? "");
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase.from("profiles").update({
      full_name: `${firstName} ${lastName}`.trim(),
      preferred_name: preferredName || null,
      phone: phone || null,
      residential_address: address || null,
      emergency_contact_name: ecName || null,
      emergency_contact_phone: ecPhone || null,
    }).eq("id", user.id);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    toast.success("Personal information saved.");
    router.back();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Personal information</h1>
        </div>
      </div>
      <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-8 w-full">

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <h2 className="text-lg font-bold text-heading border-b border-border pb-4">Legal name</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <input className={INPUT} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name" />
          </Field>
          <Field label="Last name">
            <input className={INPUT} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Your last name" />
          </Field>
        </div>
        <Field label="Preferred name" hint="This is how your name appears internally.">
          <input className={INPUT} value={preferredName} onChange={e => setPreferredName(e.target.value)} placeholder="e.g. Kofi (optional)" />
        </Field>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <h2 className="text-lg font-bold text-heading border-b border-border pb-4">Contact details</h2>
        <Field label="Email address" hint="To change your email, please contact support.">
          <input className={`${INPUT} opacity-60 cursor-not-allowed`} value={email} readOnly />
        </Field>
        <Field label="Phone number" hint="Used by DirectRent for account security.">
          <input className={INPUT} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233 20 000 0000" />
        </Field>
        <Field label="Residential address" hint="Your current home address.">
          <input className={INPUT} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 12 High Street, Accra" />
        </Field>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-heading">Emergency contact</h2>
          <p className="text-sm text-body/70 mt-1">Shared only when necessary in an emergency situation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input className={INPUT} value={ecName} onChange={e => setEcName(e.target.value)} placeholder="Contact's full name" />
          </Field>
          <Field label="Phone number">
            <input className={INPUT} type="tel" value={ecPhone} onChange={e => setEcPhone(e.target.value)} placeholder="+233 20 000 0000" />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-bold transition shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
          <Link prefetch={false} href="/agent/profile" className="rounded-full border border-border bg-card hover:bg-slate-50 text-heading px-8 py-3 text-sm font-bold transition">
            Cancel
          </Link>
        </div>
        {error && <p className="text-sm font-semibold text-accent">{error}</p>}
      </div>
    </form>
    </div>
  );
}
