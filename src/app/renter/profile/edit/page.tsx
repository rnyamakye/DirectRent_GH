"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INTEREST_OPTIONS = [
  "Photography", "Cooking", "Hiking", "Reading", "Music",
  "Travel", "Fitness", "Gaming", "Art", "Football",
  "Movies", "Dancing", "Yoga", "Cycling", "Swimming",
  "Fashion", "Technology", "Nature", "Volunteering", "Languages",
];

export default function RenterProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [languages, setLanguages] = useState("");
  const [funFact, setFunFact] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

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
        .select("full_name, bio, location, occupation, languages, fun_fact, interests, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setOccupation(profile.occupation ?? "");
        setLanguages(profile.languages ?? "");
        setFunFact(profile.fun_fact ?? "");
        setInterests(profile.interests ?? []);
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

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let uploadedAvatarUrl = avatarUrl;

    // ── Step 1: Upload avatar via server API route (admin client bypasses RLS) ──
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
      // Clear the pending file — it's been uploaded
      setAvatarFile(null);
    }

    // ── Step 2: Save text fields to profiles table ──
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        location,
        occupation,
        languages,
        fun_fact: funFact,
        interests,
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
  const initials = (fullName || "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Edit public profile</h1>
        <p className="text-base text-body/80">
          This information will be visible to agents and artisans you interact with.
        </p>
      </div>

      <div className="flex flex-col gap-10 w-full">
        {/* LEFT COLUMN: Avatar & About me */}
        <div className="flex flex-col gap-10 w-full">
          {/* Avatar section */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-6 shadow-sm">
            <div className="relative flex-shrink-0 mx-auto sm:mx-0 lg:mx-auto">
              <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-mint border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-4xl lg:text-6xl">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 lg:bottom-3 lg:right-3 w-10 h-10 lg:w-12 lg:h-12 bg-heading hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg transition hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-5 lg:h-5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="flex flex-col items-center sm:items-start lg:items-center gap-1 w-full">
              <h2 className="text-xl lg:text-2xl font-bold text-heading">{fullName || "Your Name"}</h2>
              {avatarFile ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    New photo ready
                  </span>
                </div>
              ) : (
                <p className="text-sm text-body/70 mt-1">Click the camera icon to upload a photo.</p>
              )}
              <p className="text-xs text-body/50 mt-1">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>

          {/* About me */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-heading">About me</h2>
              <p className="text-sm text-body/70 mt-1">Write something fun and punchy about yourself.</p>
            </div>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="e.g. I love exploring new neighbourhoods and finding hidden gem apartments…"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
              <span className="absolute bottom-3 right-4 text-xs text-body/40">{bio.length}/500</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal details & Interests */}
        <div className="flex flex-col gap-10 w-full">
          {/* Personal details */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <h2 className="text-xl font-bold text-heading">Personal details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
                  <span>👤</span> Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              {/* Occupation */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
                  <span>💼</span> My work
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software engineer"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
                  <span>📍</span> Where I live
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kumasi, Ghana"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
                  <span>🌍</span> Languages I speak
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Twi"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              {/* Fun fact */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 flex items-center gap-2">
                  <span>⚡</span> My fun fact
                </label>
                <input
                  type="text"
                  value={funFact}
                  onChange={(e) => setFunFact(e.target.value)}
                  placeholder="e.g. I once hiked the Volta region solo"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-heading">My interests</h2>
              <p className="text-sm text-body/70 mt-1">Find common ground with agents and other renters by sharing what you&apos;re into.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {INTEREST_OPTIONS.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${active
                      ? "bg-heading text-white border-heading shadow-md scale-105"
                      : "bg-card text-body border-border hover:border-heading/40 hover:text-heading"
                      }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-body/50">{interests.length} selected</p>
          </div>

          {/* Save button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            {saveError && (
              <p className="text-sm font-semibold text-accent order-2 sm:order-1">{saveError}</p>
            )}
            <div className="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2 sm:ml-auto">
              <button
                onClick={() => router.push("/renter/dashboard")}
                className="flex-1 sm:flex-none rounded-full border border-border bg-card hover:bg-slate-50 text-heading px-8 py-3 text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none rounded-full bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-bold transition shadow-sm hover:shadow-primary/20 disabled:opacity-50"
              >
                {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
