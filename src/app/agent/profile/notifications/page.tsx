"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
type NotifPrefs = {
  new_listing_alerts: boolean;
  saved_listing_updates: boolean;
  review_notifications: boolean;
  artisan_messages: boolean;
  promotional_emails: boolean;
  sms_alerts: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  new_listing_alerts: true,
  saved_listing_updates: true,
  review_notifications: true,
  artisan_messages: true,
  promotional_emails: false,
  sms_alerts: false,
};

const NOTIF_OPTIONS: { key: keyof NotifPrefs; label: string; description: string; badge?: string }[] = [
  {
    key: "new_listing_alerts",
    label: "New listing alerts",
    description: "Get notified when new properties matching your preferences are listed.",
    badge: "Email",
  },
  {
    key: "saved_listing_updates",
    label: "Saved listing updates",
    description: "Receive updates when a property you've saved changes price or status.",
    badge: "Email",
  },
  {
    key: "review_notifications",
    label: "Review notifications",
    description: "Know when agents or artisans respond to your reviews.",
    badge: "Email",
  },
  {
    key: "artisan_messages",
    label: "Artisan messages",
    description: "Get notified when an artisan replies to your enquiry.",
    badge: "Email",
  },
  {
    key: "promotional_emails",
    label: "Promotions & tips",
    description: "Occasional emails with tips, deals and platform updates from DirectRent.",
    badge: "Email",
  },
  {
    key: "sms_alerts",
    label: "SMS alerts",
    description: "Receive urgent alerts via text message (charges may apply).",
    badge: "SMS",
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-primary" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single();

      if (data?.notification_preferences) {
        setPrefs({ ...DEFAULT_PREFS, ...data.notification_preferences });
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggle(key: keyof NotifPrefs) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ notification_preferences: prefs })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Notifications</h1>
          <p className="text-sm text-body/70 mt-0.5">Choose what you'd like to be notified about.</p>
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full">
      

      <div className="rounded-3xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        {NOTIF_OPTIONS.map(({ key, label, description, badge }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 hover:bg-slate-50/50 transition-colors">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">{label}</span>
                {badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge === "SMS" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-body/60"}`}>
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-body/60 leading-relaxed">{description}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-bold transition shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}
          </button>
        </div>
        {error && <p className="text-sm font-semibold text-accent">{error}</p>}
      </div>
    </div>
    </div>
  );
}