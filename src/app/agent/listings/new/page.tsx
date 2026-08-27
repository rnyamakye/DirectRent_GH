"use client";
import { createClient } from "@/lib/supabase/client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [viewingFee, setViewingFee] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [propertyType, setPropertyType] = useState("Room");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [city, setCity] = useState("Accra");
  const [isSelfContained, setIsSelfContained] = useState(false);
  const [hasSharedKitchen, setHasSharedKitchen] = useState(false);
  const [hasSharedBathroom, setHasSharedBathroom] = useState(false);


  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    // e.target.files is a FileList (array-like, not a real array) —
    // Array.from() converts it to a real array so .map()/.filter() work on it.
    const selectedFiles = Array.from(e.target.files ?? []);
    setPhotos(selectedFiles);
  }

  async function handlePublish() {
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to publish a listing.");
      setSubmitting(false);
      return;
    }

    // Upload every selected photo, one at a time, collecting the
    // public URL Supabase gives back for each. Path structure:
    // {user.id}/{timestamp}-{filename} — the {user.id} prefix is what
    // the RLS policy checks against.
    const photoUrls: string[] = [];
    for (const file of photos) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      // Upload only stores the file — this separate call turns the
      // path into a real, public URL that <img> tags can use directly.
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      photoUrls.push(urlData.publicUrl);
    }

    const { count } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", user.id);

    const isQuotaExceeded = (count ?? 0) >= 5;
    const listingStatus = isQuotaExceeded ? "pending_payment" : "available";

    const payload = {
      title,
      description,
      price: Number(price),
      landmark,
      property_type: propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      is_self_contained: isSelfContained,
      has_shared_kitchen: hasSharedKitchen,
      has_shared_bathroom: hasSharedBathroom,
      status: listingStatus,
      photo_urls: photoUrls,
      city
    };

    let listing;
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");
      listing = data.listing;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    if (isQuotaExceeded) {
      try {
        const res = await fetch("/api/payments/listing/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing.id }),
        });
        const data = await res.json();
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
          return; // Do not clear submitting state during redirect
        } else {
          setError(data.error || "Failed to initialize payment.");
          setSubmitting(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to start payment.");
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(false);
    router.refresh();
    router.push(`/agent/listings`);
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
<div className="flex flex-col gap-6 max-w-md">
        <h1 className="text-xl font-bold">New listing — step {step} of 4</h1>

        {step === 1 && (
          <div className="flex flex-col gap-4">
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

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Price per month (GHS)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
              <input
                type="number"
                placeholder="Viewing fee, if any"
                value={viewingFee}
                onChange={(e) => setViewingFee(e.target.value)}
                className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Landmark, e.g. Behind the blue shop at Ayeduase"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
            />
            <textarea
              placeholder="Full description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
            />
            
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-body/60 mb-1 block">
                Room Features
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={isSelfContained}
                  onChange={(e) => setIsSelfContained(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-heading">Self Contained</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={hasSharedKitchen}
                  onChange={(e) => setHasSharedKitchen(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-heading">Shared Kitchen</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={hasSharedBathroom}
                  onChange={(e) => setHasSharedBathroom(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-heading">Shared Bathroom</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="text-sm font-supporting"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((file, index) => (
                  // URL.createObjectURL makes a temporary local preview
                  // URL for a file the user picked — no upload has
                  // happened yet, this is purely client-side.
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            <p className="font-supporting text-xs text-body">
              {photos.length} photo{photos.length === 1 ? "" : "s"} selected
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
            <p className="font-semibold">{title || "(no title)"}</p>
            <p className="font-supporting text-sm text-body">{landmark}</p>
            <p className="font-supporting text-sm text-body">{description}</p>
            <p className="font-semibold text-primary">GHS {price || "0"}/mo</p>
            <p className="font-supporting text-xs text-body">
              {photos.length} photos attached
            </p>

            <div className="rounded-lg bg-pale-clay border border-saffron px-3 py-2 text-xs font-supporting text-heading mt-2">
              ⚠️ Remember: viewing fees must be stated upfront and truthfully.
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as typeof step)}
              className="border border-border rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as typeof step)}
              className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Next
            </button>
          ) : (
            <>
              {error && (
                <p className="text-xs font-supporting text-accent">{error}</p>
              )}
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish listing"}
              </button>
            </>
          )}
          <button
            onClick={() => router.push("/agent/listings")}
            className="border border-border text-body rounded-lg px-4 py-2 text-sm font-semibold hover:border-body transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
