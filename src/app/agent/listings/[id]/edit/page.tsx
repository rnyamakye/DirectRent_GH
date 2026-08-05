"use client";

import { use, useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"available" | "unavailable">("available");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [propertyType, setPropertyType] = useState("Room");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [city, setCity] = useState("Accra");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    async function loadListing() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !listing) {
        notFound();
        return;
      }

      // Ownership check — middleware only confirms "this user is an
      // agent," not "this user owns THIS specific listing." Without
      // this, any agent could edit any other agent's listing just by
      // knowing/guessing its id.
      if (listing.agent_id !== user?.id) {
        router.push("/agent/dashboard");
        return;
      }

      setTitle(listing.title);
      setPrice(String(listing.price));
      setLandmark(listing.landmark ?? "");
      setDescription(listing.description ?? "");
      setStatus(listing.status);
      setPhotoUrls(listing.photo_urls ?? []);
      setPropertyType(listing.property_type ?? "Room");
      setBedrooms(String(listing.bedrooms ?? 1));
      setBathrooms(String(listing.bathrooms ?? 1));
      setLoading(false);
      setLatitude(listing.latitude);
      setLongitude(listing.longitude);
    }

    loadListing();
  }, [id, router]);

  function handleRemovePhoto(index: number) {
    setPhotoUrls((current) => current.filter((_, i) => i !== index));
  }

  function handleMovePhoto(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photoUrls.length) return;
    setPhotoUrls((current) => {
      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  }

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setNewFiles((current) => [...current, ...Array.from(e.target.files ?? [])]);
  }

  function handleRemoveNewPhoto(index: number) {
    setNewFiles((current) => current.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Upload any newly added files, same pattern as New Listing.
    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file);
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title,
        price: Number(price),
        landmark,
        description,
        status,
        property_type: propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        photo_urls: [...photoUrls, ...uploadedUrls],
      })
      .eq("id", id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
    router.push("/agent/listings");
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this listing permanently?");
    if (!confirmed) return;

    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", id);
    router.refresh();
    router.push("/agent/listings");
  }

  if (loading) {
    return <p className="font-supporting text-sm text-body">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/agent/dashboard" },
        { label: "My Listings", href: "/agent/listings" },
        { label: "Edit Listing" }
      ]} />
      <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
        <h1 className="text-xl font-bold">Edit listing</h1>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-body/60 mb-2 block">
            Property type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["Room", "Studio", "Apartment", "House"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPropertyType(type)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${propertyType === type
                  ? "border-primary bg-mint/30 text-primary"
                  : "border-border text-body hover:border-primary/40"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Listing title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        >
          <option>Accra</option>
          <option>Kumasi</option>
          <option>Tema</option>
          <option>Takoradi</option>
          <option>Cape Coast</option>
          <option>Other</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-body/60 mb-1.5 block">
              Bedrooms
            </label>
            <input
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-body/60 mb-1.5 block">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>
        </div>

        <input
          type="number"
          placeholder="Price per month (GHS)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        />
        <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="rounded-lg border border-border px-4 py-2 text-sm font-supporting" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-lg border border-border px-4 py-2 text-sm font-supporting" />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-body/60 mb-1.5 block">
            Pin the exact location
          </label>
          <p className="text-xs text-body/60 mb-2">
            Click on the map to drop a pin. This stays private — renters only ever see an
            approximate area, never your exact pin.
          </p>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as "available" | "unavailable")} className="rounded-lg border border-border px-4 py-2 text-sm font-supporting">
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <div>
          <p className="font-supporting text-xs text-body mb-2">Photos</p>
          <div className="grid grid-cols-4 gap-2">
            {photoUrls.map((url, index) => (
              <div key={url} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => handleMovePhoto(index, -1)} className="text-white hover:text-primary transition" title="Move left">←</button>
                  <button type="button" onClick={() => handleMovePhoto(index, 1)} className="text-white hover:text-primary transition" title="Move right">→</button>
                  <button type="button" onClick={() => handleRemovePhoto(index)} className="text-white hover:text-accent transition" title="Remove">✕</button>
                </div>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-dashed border-border aspect-square">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => handleRemoveNewPhoto(i)} className="text-white hover:text-accent transition" title="Remove">✕</button>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm">New</span>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleAddPhotos} className="text-xs font-supporting mt-3" />
        </div>

        {error && <p className="text-xs font-supporting text-accent">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={handleDelete} className="border border-accent text-accent rounded-lg px-4 py-2 text-sm font-semibold">
            Delete listing
          </button>
        </div>
      </form>
    </div>
  );
}