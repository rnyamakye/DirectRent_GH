"use client";
import { HeartSaveButton } from "@/components/heart-save-button";

export type Listing = {
  id: string | number;
  title: string;
  location?: string;
  area: string;
  style?: string;
  space?: string;
  price: number;
  unit?: string;
  rating?: number;
  reviews?: number;
  beds?: number;
  baths?: number;
  image?: string;
  isNew?: boolean;
  isBoosted?: boolean;
  isUnavailable?: boolean;
};

export function ListingCard({ 
  listing,
  initialSaved = false,
  isLoggedIn = false,
  hideSaveButton = false
}: { 
  listing: Listing;
  initialSaved?: boolean;
  isLoggedIn?: boolean;
  hideSaveButton?: boolean;
}) {
  // Use a fallback image if none provided
  const imageUrl = listing.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600";

  return (
    <article className={`group cursor-pointer ${listing.isUnavailable ? "opacity-75" : ""}`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={imageUrl}
          alt={listing.title}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${listing.isUnavailable ? "grayscale" : ""}`}
        />
        {/* Heart save */}
        {!hideSaveButton && (
          <HeartSaveButton targetId={listing.id} initialSaved={initialSaved} isLoggedIn={isLoggedIn} />
        )}
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 items-start">
          {listing.isUnavailable && (
            <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow backdrop-blur">
              Unavailable
            </span>
          )}
          {!listing.isUnavailable && listing.isBoosted && (
            <span className="rounded-full bg-saffron px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-heading shadow">
              Boosted
            </span>
          )}
          {!listing.isUnavailable && listing.isNew && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-heading shadow">
              New
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-heading text-xs sm:text-sm">{listing.title}</p>
            <p className="mt-0.5 truncate text-[10px] sm:text-xs text-body/60">{listing.area}</p>
          </div>
          {listing.rating !== undefined && (
            <div className="flex shrink-0 items-center gap-1 text-[10px] sm:text-xs font-semibold text-heading">
              <StarIcon />
              {listing.rating}
            </div>
          )}
        </div>
        {listing.reviews !== undefined && (
          <p className="mt-1 text-[10px] sm:text-xs text-body/50">{listing.reviews} reviews</p>
        )}
        <p className="mt-2 text-xs sm:text-sm">
          <span className="font-bold text-heading">GH&#8373;{listing.price.toLocaleString()}</span>
          {listing.unit && <span className="text-body/60"> {listing.unit}</span>}
        </p>
        {(listing.beds !== undefined || listing.baths !== undefined || listing.style !== undefined) && (
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 sm:gap-3 text-[10px] sm:text-xs text-body/60">
            {listing.beds !== undefined && <span>{listing.beds} bed{listing.beds > 1 ? "s" : ""}</span>}
            {listing.beds !== undefined && (listing.baths !== undefined || listing.style !== undefined) && <span>·</span>}
            {listing.baths !== undefined && <span>{listing.baths} bath{listing.baths > 1 ? "s" : ""}</span>}
            {listing.baths !== undefined && listing.style !== undefined && <span>·</span>}
            {listing.style !== undefined && <span className="truncate">{listing.style}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
