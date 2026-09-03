"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

const STEPS = [
  { id: 1, title: "Basic Info", icon: "🏠" },
  { id: 2, title: "Details", icon: "📋" },
  { id: 3, title: "Location", icon: "📍" },
  { id: 4, title: "Photos", icon: "📸" },
  { id: 5, title: "Review", icon: "✅" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [viewingFee, setViewingFee] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [propertyType, setPropertyType] = useState("Room");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [city, setCity] = useState("Accra");
  const [isSelfContained, setIsSelfContained] = useState(false);
  const [hasSharedKitchen, setHasSharedKitchen] = useState(false);
  const [hasSharedBathroom, setHasSharedBathroom] = useState(false);

  // Upload & UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Image Logic ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    addPhotos(selectedFiles);
  };

  const addPhotos = (newFiles: File[]) => {
    // Only accept image files
    const validImages = newFiles.filter(file => file.type.startsWith("image/"));
    setPhotos(prev => {
      const combined = [...prev, ...validImages];
      // Limit to 10 photos max
      return combined.slice(0, 10);
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addPhotos(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      // We don't store Object URLs in state, we generate them on the fly
      // but if we did, we'd revoke them here.
    };
  }, []);


  // --- Submission Logic ---
  async function handlePublish() {
    setSubmitting(true);
    setError("");
    setUploadProgress(0);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to publish a listing.");
      setSubmitting(false);
      return;
    }

    const photoUrls: string[] = [];
    let completedUploads = 0;

    for (const file of photos) {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      photoUrls.push(urlData.publicUrl);

      completedUploads++;
      setUploadProgress(Math.round((completedUploads / photos.length) * 50)); // 50% for photos
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
      city,
      latitude,
      longitude
    };

    setUploadProgress(75); // Saving to DB

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
      setUploadProgress(100);
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
          return;
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
    router.replace(`/listings/${listing.id}`); // Redirect to the newly created listing
  }

  // --- Validation ---
  const isStep1Valid = title.trim() !== "" && price !== "" && Number(price) > 0;
  const isStep2Valid = description.trim() !== "" && landmark.trim() !== "";
  const isStep3Valid = latitude !== null && longitude !== null;
  const isStep4Valid = photos.length >= 1; // Require at least 1 photo

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      setError("Please fill out all required fields (Title & Price).");
      return;
    }
    if (step === 2 && !isStep2Valid) {
      setError("Please provide a landmark and description.");
      return;
    }
    if (step === 3 && !isStep3Valid) {
      setError("Please pin the location of the property on the map.");
      return;
    }
    if (step === 4 && !isStep4Valid) {
      setError("Please upload at least one photo of the property.");
      return;
    }

    setError("");
    setStep((s) => (s + 1) as typeof step);
  };

  return (
    <div className="min-h-screen bg-canvas pb-20 pt-10 px-4">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-heading mb-3">Create a Listing</h1>
          <p className="text-body/80 text-lg">Add a new property to your portfolio</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-border/40">
            <div
              style={{ width: `${(step / 5) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500 ease-out"
            ></div>
          </div>
          <div className="flex justify-between w-full px-2">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={twMerge(
                  "flex flex-col items-center gap-2 transition-opacity duration-300",
                  step >= s.id ? "opacity-100" : "opacity-40 grayscale"
                )}
              >
                <div className={twMerge(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border-2 transition-colors",
                  step >= s.id ? "bg-white border-primary text-primary" : "bg-card border-border text-body"
                )}>
                  {s.icon}
                </div>
                <span className={twMerge("text-xs font-bold", step >= s.id ? "text-primary" : "text-body/60")}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">

          <div className="p-2 md:p-6">

            {error && (
              <div className="mb-6 bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-300">

                <div>
                  <label className="text-sm font-bold text-heading mb-3 block">Property Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: "Room", icon: "🚪" },
                      { type: "Studio", icon: "🛋️" },
                      { type: "Apartment", icon: "🏢" },
                      { type: "House", icon: "🏡" }
                    ].map(({ type, icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={twMerge(
                          "rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                          propertyType === type
                            ? "border-primary bg-mint/20 text-primary shadow-sm"
                            : "border-border/50 bg-white text-body hover:border-primary/30"
                        )}
                      >
                        <span className="text-3xl">{icon}</span>
                        <span className="font-bold text-sm">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      id="title"
                      placeholder="e.g. Spacious En-suite Room near Campus"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="peer w-full rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading placeholder-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <label htmlFor="title" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-body/50 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary">
                      Listing Title <span className="text-accent">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="peer w-full appearance-none rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      >
                        <option>Accra</option>
                        <option>Kumasi</option>
                        <option>Tema</option>
                        <option>Takoradi</option>
                        <option>Cape Coast</option>
                        <option>Other</option>
                      </select>
                      <label htmlFor="city" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-primary">
                        City
                      </label>
                      <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-body/50">
                        ▼
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          id="bedrooms"
                          min="0"
                          value={bedrooms}
                          onChange={(e) => setBedrooms(e.target.value)}
                          className="peer w-full rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <label htmlFor="bedrooms" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-primary">
                          Bedrooms
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          id="bathrooms"
                          min="0"
                          value={bathrooms}
                          onChange={(e) => setBathrooms(e.target.value)}
                          className="peer w-full rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <label htmlFor="bathrooms" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-primary">
                          Bathrooms
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="number"
                        id="price"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="peer w-full rounded-2xl border border-border bg-white/50 pl-16 pr-5 pt-7 pb-3 text-base text-heading placeholder-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <span className="absolute left-5 top-5 text-body/60 font-bold">GHS</span>
                      <label htmlFor="price" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-body/50 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:left-16 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary">
                        Rent / Month <span className="text-accent">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        id="viewingFee"
                        placeholder="0"
                        value={viewingFee}
                        onChange={(e) => setViewingFee(e.target.value)}
                        className="peer w-full rounded-2xl border border-border bg-white/50 pl-16 pr-5 pt-7 pb-3 text-base text-heading placeholder-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <span className="absolute left-5 top-5 text-body/60 font-bold">GHS</span>
                      <label htmlFor="viewingFee" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-body/50 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:left-16 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary">
                        Viewing Fee (Optional)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="relative">
                  <input
                    type="text"
                    id="landmark"
                    placeholder="e.g. Opposite the central mall"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="peer w-full rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading placeholder-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <label htmlFor="landmark" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-body/50 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary">
                    Specific Landmark / Location <span className="text-accent">*</span>
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    id="description"
                    placeholder="Describe the property, neighborhood, and any specific rules..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="peer w-full resize-none rounded-2xl border border-border bg-white/50 px-5 pt-7 pb-3 text-base text-heading placeholder-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <label htmlFor="description" className="absolute left-5 top-2 text-xs font-bold uppercase tracking-wider text-body/50 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary">
                    Full Description <span className="text-accent">*</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-bold text-heading mb-3 block">Property Features</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={twMerge(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelfContained ? "border-primary bg-mint/20 shadow-sm" : "border-border bg-white hover:border-primary/30"
                    )}>
                      <input
                        type="checkbox"
                        checked={isSelfContained}
                        onChange={(e) => setIsSelfContained(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-heading">Self Contained</span>
                    </label>

                    <label className={twMerge(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      hasSharedKitchen ? "border-primary bg-mint/20 shadow-sm" : "border-border bg-white hover:border-primary/30"
                    )}>
                      <input
                        type="checkbox"
                        checked={hasSharedKitchen}
                        onChange={(e) => setHasSharedKitchen(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-heading">Shared Kitchen</span>
                    </label>

                    <label className={twMerge(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      hasSharedBathroom ? "border-primary bg-mint/20 shadow-sm" : "border-border bg-white hover:border-primary/30"
                    )}>
                      <input
                        type="checkbox"
                        checked={hasSharedBathroom}
                        onChange={(e) => setHasSharedBathroom(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-heading">Shared Bathroom</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Location */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-heading mb-1">Pin Property Location</h3>
                  <p className="text-sm text-body/70">Click on the map to pinpoint exactly where this property is located.</p>
                </div>

                <div className="bg-slate-50 border border-border/80 rounded-2xl p-2 shadow-sm">
                  <MapPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Photos (Enhanced Upload) */}
            {step === 4 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-heading mb-1">Add Property Photos</h3>
                  <p className="text-sm text-body/70">Upload up to 10 high-quality images. Great photos attract more tenants!</p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  className={twMerge(
                    "relative w-full h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer overflow-hidden",
                    isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/80 bg-slate-50 hover:bg-slate-100 hover:border-primary/40",
                    photos.length >= 10 && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={photos.length >= 10}
                  />
                  <div className="bg-white p-4 rounded-full shadow-sm text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-heading">Click to browse or drag images here</p>
                    <p className="text-xs text-body/60 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </div>

                {/* Preview Grid */}
                {photos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-heading">{photos.length} / 10 Photos Uploaded</span>
                      <button onClick={() => setPhotos([])} className="text-xs font-semibold text-accent hover:underline">Clear all</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {photos.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} // cleanup
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                              className="w-8 h-8 rounded-full bg-accent/90 text-white flex items-center justify-center hover:bg-accent hover:scale-110 transition-transform"
                              title="Remove photo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-heading/80 backdrop-blur text-white text-[10px] font-bold uppercase rounded-md">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Review */}
            {step === 5 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-heading">Review Your Listing</h3>
                  <p className="text-sm text-body/70">Ensure all details look perfect before publishing.</p>
                </div>

                <div className="bg-slate-50 border border-border/60 rounded-3xl overflow-hidden shadow-sm">
                  {/* Hero Cover (First Photo) */}
                  {photos.length > 0 && (
                    <div className="h-48 w-full relative">
                      <img
                        src={URL.createObjectURL(photos[0])}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-6 flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">{propertyType}</span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full">{photos.length} Photos</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div>
                      <h4 className="text-2xl font-extrabold text-heading">{title}</h4>
                      <p className="text-body/70 flex items-center gap-1.5 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {landmark}, {city}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-body/50 font-bold uppercase tracking-wider">Rent</span>
                        <span className="text-lg font-extrabold text-primary">GHS {price}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-body/50 font-bold uppercase tracking-wider">Bedrooms</span>
                        <span className="text-lg font-bold text-heading">{bedrooms}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-body/50 font-bold uppercase tracking-wider">Bathrooms</span>
                        <span className="text-lg font-bold text-heading">{bathrooms}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-body/50 font-bold uppercase tracking-wider">Viewing Fee</span>
                        <span className="text-lg font-bold text-heading">{viewingFee ? `GHS ${viewingFee}` : "None"}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-heading mb-2">Description</h5>
                      <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">{description}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-heading mb-2">Features</h5>
                      <div className="flex flex-wrap gap-2">
                        {isSelfContained && <span className="px-3 py-1.5 rounded-lg bg-mint/50 border border-mint text-primary text-xs font-bold">Self Contained</span>}
                        {hasSharedKitchen && <span className="px-3 py-1.5 rounded-lg bg-mint/50 border border-mint text-primary text-xs font-bold">Shared Kitchen</span>}
                        {hasSharedBathroom && <span className="px-3 py-1.5 rounded-lg bg-mint/50 border border-mint text-primary text-xs font-bold">Shared Bathroom</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {viewingFee && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex gap-3 text-amber-800">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm leading-relaxed">
                      <strong>Reminder on Viewing Fees:</strong> Ensure your stated viewing fee is exactly what will be charged. Platform rules prohibit changing this fee in person.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
              <button
                onClick={() => step > 1 ? setStep((s) => (s - 1) as typeof step) : router.push("/agent/listings")}
                className="px-6 py-3 rounded-xl border border-border bg-white text-heading font-bold text-sm hover:bg-slate-50 hover:shadow-sm transition-all"
                disabled={submitting}
              >
                {step > 1 ? "Back" : "Cancel"}
              </button>

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              ) : (
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={handlePublish}
                    disabled={submitting}
                    className="relative overflow-hidden group px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-wait min-w-[200px]"
                  >
                    {submitting ? (
                      <div className="flex flex-col items-center">
                        <span className="mb-1">Publishing ({uploadProgress}%)</span>
                        <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Publish Listing
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
