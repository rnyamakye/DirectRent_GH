"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditArtisanProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [trade, setTrade] = useState("Electrician");
  const [serviceArea, setServiceArea] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState<"available" | "busy">("available");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Profiles fields
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("artisan_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (baseProfile) {
        setFullName(baseProfile.full_name ?? "");
        setAvatarUrl(baseProfile.avatar_url ?? null);
      }

      if (profile) {
        setTrade(profile.trade);
        setServiceArea(profile.service_area ?? "");
        setBio(profile.bio ?? "");
        setPhone(profile.phone ?? "");
        setAvailability(profile.availability ?? "available");
        setServices(profile.services ?? []);
        setPhotoUrls(profile.photo_urls ?? []);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function handleAddService() {
    const trimmed = newService.trim();
    if (trimmed === "" || services.includes(trimmed)) return;
    setServices((current) => [...current, trimmed]);
    setNewService("");
  }

  function handleServiceKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddService();
    }
  }

  function handleRemoveService(service: string) {
    setServices((current) => current.filter((s) => s !== service));
  }

  function handleRemovePhoto(url: string) {
    setPhotoUrls((current) => current.filter((u) => u !== url));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const totalAfter = photoUrls.length + newFiles.length + selected.length;
    if (totalAfter > 6) {
      setError("Maximum 6 photos total.");
      return;
    }
    setError("");
    setNewFiles((current) => [...current, ...selected]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file);
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    let uploadedAvatarUrl = avatarUrl;
    if (avatarFile) {
      const form = new FormData();
      form.append("file", avatarFile);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(`Avatar upload failed: ${json.error ?? "Unknown error"}`);
        setSubmitting(false);
        return;
      }
      uploadedAvatarUrl = json.avatarUrl;
      setAvatarUrl(uploadedAvatarUrl);
      setAvatarFile(null);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: uploadedAvatarUrl })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setSubmitting(false);
      return;
    }

    const { error: upsertError } = await supabase.from("artisan_profiles").upsert({
      id: user.id,
      trade,
      service_area: serviceArea,
      bio,
      phone,
      services,
      availability,
      photo_urls: [...photoUrls, ...uploadedUrls],
    });

    setSubmitting(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    router.push("/artisan/dashboard");
  }

  if (loading) {
    return <p className="font-supporting text-sm text-body">Loading...</p>;
  }

  const displayAvatar = avatarPreview ?? avatarUrl;
  const initials = (fullName || "A").charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-10 w-full max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Edit profile</h1>
        <p className="text-base text-body/80">Manage how you appear to customers.</p>
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
          <h2 className="text-lg font-bold text-heading">{fullName || "Your Name"}</h2>
          {avatarFile ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                New photo ready — click Save changes
              </span>
            </div>
          ) : (
            <p className="text-sm text-body/70 mt-1">Click the camera icon to upload a profile photo.</p>
          )}
          <p className="text-xs text-body/50">JPG, PNG or WebP · Max 5 MB</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
        <h2 className="text-xl font-bold text-heading">Basics</h2>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Public Display Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Trade
          </label>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-card"
          >
            <option value="Electrician">Electrician</option>
            <option value="Painter">Painter</option>
            <option value="Plumber">Plumber</option>
            <option value="Mover">Mover</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Service area
          </label>
          <input
            type="text"
            placeholder="e.g. Ayeduase, Bomso"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-body/70 mb-2 block">
            Availability
          </label>
          <div className="flex rounded-full border border-border overflow-hidden w-fit shadow-sm">
            <button
              type="button"
              onClick={() => setAvailability("available")}
              className={`px-6 py-2.5 text-sm font-semibold transition ${availability === "available" ? "bg-primary text-white" : "bg-card text-body hover:bg-slate-50"
                }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setAvailability("busy")}
              className={`px-6 py-2.5 text-sm font-semibold transition ${availability === "busy" ? "bg-accent text-white" : "bg-card text-body hover:bg-slate-50"
                }`}
            >
              Busy
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-heading">Services offered</h2>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service}
              className="flex items-center gap-1.5 rounded-full bg-mint text-primary text-sm font-semibold px-4 py-1.5"
            >
              {service}
              <button
                type="button"
                onClick={() => handleRemoveService(service)}
                className="text-primary/70 hover:text-primary transition-colors text-lg leading-none"
                aria-label={`Remove ${service}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a service"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={handleServiceKeyDown}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
          <button
            type="button"
            onClick={handleAddService}
            className="rounded-full bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-bold transition shadow-sm hover:shadow-primary/20"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-heading">
          Photos ({photoUrls.length + newFiles.length}/6)
        </h2>
        <div className="flex flex-wrap gap-3">
          {photoUrls.map((url) => (
            <div key={url} className="relative group">
              <img src={url} alt="" className="w-24 h-24 object-cover rounded-2xl" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(url)}
                className="absolute -top-2 -right-2 bg-accent hover:bg-red-700 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                ×
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div
              key={i}
              className="w-24 h-24 rounded-2xl bg-pale-clay flex items-center justify-center text-[10px] font-semibold text-center px-2 text-body/70 border border-border"
            >
              {file.name}
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotosChange}
          disabled={photoUrls.length + newFiles.length >= 6}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors mt-2"
        />
      </div>

      {error && <p className="text-sm font-semibold text-accent">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-bold transition shadow-sm hover:shadow-primary/20 disabled:opacity-50 mt-2"
      >
        {submitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
