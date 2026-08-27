"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Link from "next/link";
type PaymentMethod = {
  id: string;
  type: "mobile_money" | "card";
  label: string;
  last_four: string | null;
  provider: string | null;
  is_default: boolean;
  created_at: string;
};

const PROVIDERS_MM = ["MTN Mobile Money", "Vodafone Cash", "AirtelTigo Money"];

const INPUT = "w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card";
const SELECT = `${INPUT} cursor-pointer`;

function MethodIcon({ type }: { type: "mobile_money" | "card" }) {
  if (type === "mobile_money") {
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    </div>
  );
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Add form
  const [addType, setAddType] = useState<"mobile_money" | "card">("mobile_money");
  const [addLabel, setAddLabel] = useState("");
  const [addProvider, setAddProvider] = useState(PROVIDERS_MM[0]);
  const [addPhone, setAddPhone] = useState("");
  const [addLastFour, setAddLastFour] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setMethods(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (addType === "mobile_money" && !addPhone) { setAddError("Phone number is required."); return; }
    if (addType === "card" && addLastFour.length !== 4) { setAddError("Enter the last 4 digits of your card."); return; }

    setAddSaving(true);
    const supabase = createClient();
    const label = addType === "mobile_money"
      ? `${addProvider} · ${addPhone}`
      : addLabel || `Card ending ${addLastFour}`;

    const { error } = await supabase.from("payment_methods").insert({
      user_id: userId,
      type: addType,
      label,
      provider: addProvider || null,
      last_four: addLastFour || null,
      is_default: methods.length === 0,
    });

    setAddSaving(false);
    if (error) { setAddError(error.message); return; }

    // Reset form
    setShowAdd(false);
    setAddPhone(""); setAddLastFour(""); setAddLabel("");
    setAddProvider(PROVIDERS_MM[0]); setAddType("mobile_money");
    await load();
  }

  async function handleSetDefault(id: string) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("payment_methods").delete().eq("id", deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    await load();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Payments &amp; methods</h1>
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full">
      

      {/* Methods list */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <p className="text-base font-semibold text-heading">No payment methods yet</p>
            <p className="text-sm text-body/60 max-w-xs">Add a mobile money account or card to make payments on DirectRent easier.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {methods.map(m => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-5">
                <MethodIcon type={m.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-heading truncate">{m.label}</p>
                    {m.is_default && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-body/60 capitalize">{m.type.replace("_", " ")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!m.is_default && (
                    <button
                      onClick={() => handleSetDefault(m.id)}
                      className="text-xs text-body/60 hover:text-heading font-semibold transition border border-border rounded-full px-3 py-1.5"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(m.id)}
                    className="text-xs text-accent/70 hover:text-accent font-semibold transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add method */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-3 w-full rounded-3xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 px-6 py-5 text-sm font-semibold text-body/60 hover:text-primary transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          Add a payment method
        </button>
      ) : (
        <form onSubmit={handleAdd} className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-lg font-bold text-heading border-b border-border pb-4">Add payment method</h2>

          {/* Type selector */}
          <div className="flex gap-3">
            {(["mobile_money", "card"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setAddType(t)}
                className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition ${addType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-body/60 hover:border-heading/30"}`}
              >
                {t === "mobile_money" ? "📱 Mobile Money" : "💳 Card"}
              </button>
            ))}
          </div>

          {addType === "mobile_money" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">Provider</label>
                <select className={SELECT} value={addProvider} onChange={e => setAddProvider(e.target.value)}>
                  {PROVIDERS_MM.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">Phone number</label>
                <input className={INPUT} type="tel" value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="+233 20 000 0000" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">Card label <span className="font-normal text-body/50">(optional)</span></label>
                <input className={INPUT} value={addLabel} onChange={e => setAddLabel(e.target.value)} placeholder="e.g. My Visa card" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-heading">Last 4 digits</label>
                <input className={INPUT} maxLength={4} value={addLastFour} onChange={e => setAddLastFour(e.target.value.replace(/\D/g, ""))} placeholder="1234" />
              </div>
            </>
          )}

          {addError && <p className="text-sm text-accent font-semibold">{addError}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={addSaving} className="rounded-full bg-primary hover:bg-primary-hover text-white px-6 py-2.5 text-sm font-bold transition disabled:opacity-50">
              {addSaving ? "Adding…" : "Add method"}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setAddError(""); }} className="rounded-full border border-border text-heading px-6 py-2.5 text-sm font-bold hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Remove payment method"
        message="Are you sure you want to remove this payment method? It will no longer be available for future payments."
        confirmText="Remove"
        cancelText="Keep it"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
      </div>
    </div>
  );
}
