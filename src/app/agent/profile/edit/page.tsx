"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgentProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Profile fields
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState("");
  const [funFact, setFunFact] = useState("");

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name, bio, location, languages, fun_fact, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBusinessName(profile.business_name ?? "");
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setLanguages(profile.languages ?? "");
        setFunFact(profile.fun_fact ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let uploadedAvatarUrl = avatarUrl;

    if (avatarFile) {
      const form = new FormData();
      form.append("file", avatarFile);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        setSaving(false);
        setSaveError(`Avatar upload failed: ${json.error ?? "Unknown error"}`);
        return;
      }

      uploadedAvatarUrl = json.avatarUrl;
      setAvatarUrl(uploadedAvatarUrl);
      setAvatarFile(null);
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        business_name: businessName,
        bio,
        location,
        languages,
        fun_fact: funFact,
        avatar_url: uploadedAvatarUrl,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setSaveError(`Profile save failed: ${updateError.message}`);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const displayAvatar = avatarPreview ?? avatarUrl;
  const initials = (businessName || "A").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Edit public profile</h1>
        <p className="text-base text-body/80">
          This information will be visible to renters viewing your listings.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-mint border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-4xl">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-heading hover:bg-black text-white rounded-full flex items-center justify-center shadow-md transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="text-center sm:text-left flex flex-col gap-1">
          <h2 className="text-lg font-bold text-heading">{businessName || "Your Business Name"}</h2>
          {avatarFile ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                New photo ready — click Save changes
              </span>
            </div>
          ) : (
            <p className="text-sm text-body/70 mt-1">Click the camera icon to upload a profile photo.</p>
          )}
          <p className="text-xs text-body/50">JPG, PNG or WebP · Max 5 MB</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-heading">About my business</h2>
          <p className="text-sm text-body/70 mt-1">Tell renters what makes your properties special.</p>
        </div>
        <div className="relative">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={5}
            placeholder="e.g. We specialize in luxury apartments in East Legon..."
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
          />
          <span className="absolute bottom-3 right-4 text-xs text-body/40">{bio.length}/500</span>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
        <h2 className="text-xl font-bold text-heading">Public details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
              <span>💼</span> Business name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. DirectRent Properties"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
              <span>📍</span> Office location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kumasi, Ghana"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
              <span>🌍</span> Languages we speak
            </label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. English, Twi"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
              <span>⚡</span> Agency fun fact
            </label>
            <input
              type="text"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              placeholder="e.g. We have housed over 500 renters this year!"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-bold transition shadow-sm hover:shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </button>
          <button
            onClick={() => router.push("/agent/dashboard")}
            className="rounded-full border border-border bg-card hover:bg-slate-50 text-heading px-8 py-3 text-sm font-bold transition"
          >
            Done
          </button>
        </div>
        {saveError && (
          <p className="text-sm font-semibold text-accent">{saveError}</p>
        )}
      </div>
    </div>
  );
}
