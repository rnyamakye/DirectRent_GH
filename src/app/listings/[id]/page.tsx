import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaveButton } from "@/components/save-button";
import { ReviewsSection } from "@/components/reviews-section";
import { BackButton } from "@/components/back-button";
import { ContactAgentButton } from "@/components/contact-agent-button";
import { RequestTourButton } from "./request-tour-button";

import { ShareButton } from "@/components/share-button";
import { TrackListingView } from "@/components/track-listing-view";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?returnTo=/listings/${id}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, profiles!listings_agent_id_fkey(full_name, phone, email, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }


  let initialSaved = false;
  let existingTour = null;

  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_listings")
      .select("*")
      .eq("renter_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    initialSaved = !!savedRow;

    const { data: tourRow } = await supabase
      .from("tour_requests")
      .select("id, status")
      .eq("renter_id", user.id)
      .eq("listing_id", id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (tourRow) {
      existingTour = tourRow;
    }
  }
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, profiles(full_name)")
    .eq("target_type", "listing")
    .eq("target_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer_id: r.reviewer_id,
    reviewerName: (r.profiles as any)?.full_name ?? "Anonymous",
  }));

  const photos = listing.photo_urls || [];
  const displayPhotos = [...photos];
  while (displayPhotos.length < 5 && displayPhotos.length > 0) {
    displayPhotos.push(displayPhotos[0]);
  }

  const hasPhotos = displayPhotos.length > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      <TrackListingView listingId={id} />
      <BackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">{listing.title}</h1>
        <div className="flex items-center gap-4 text-sm font-semibold underline text-heading">
          <ShareButton title={listing.title} />
          <div className="flex items-center gap-2 hover:bg-slate-100 rounded-lg transition">
            <SaveButton listingId={id} initialSaved={initialSaved} isLoggedIn={!!user} />
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {hasPhotos ? (
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[500px] md:h-[60vh] min-h-[400px] rounded-2xl overflow-hidden group">
          <div className="col-span-4 sm:col-span-2 row-span-2 relative">
            <Image
              src={displayPhotos[0]}
              alt={listing.title}
              fill
              className="object-cover hover:opacity-90 transition cursor-pointer"
            />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <Image src={displayPhotos[1]} alt="" fill className="object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <Image src={displayPhotos[2]} alt="" fill className="object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <Image src={displayPhotos[3]} alt="" fill className="object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <Image src={displayPhotos[4]} alt="" fill className="object-cover hover:opacity-90 transition cursor-pointer" />
            <button className="absolute bottom-4 right-4 bg-white border border-heading px-4 py-1.5 rounded-lg text-sm font-semibold text-heading shadow-md hover:bg-slate-50 transition flex items-center gap-2">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '12px', width: '12px', fill: 'currentColor' }}><path d="M14.33 2.67h-3V1.33h3c.74 0 1.34.6 1.34 1.34v3h-1.34v-3zM2.67 2.67v3H1.33v-3c0-.74.6-1.34 1.34-1.34h3v1.34h-3zm11.66 10.66v-3h1.34v3c0 .74-.6 1.34-1.34 1.34h-3v-1.34h3zm-11.66 0h3v1.34h-3c-.74 0-1.34-.6-1.34-1.34v-3h1.34v3z"></path></svg>
              Show all photos
            </button>
          </div>
        </div>
      ) : (
        <div className="h-[40vh] sm:h-[500px] md:h-[60vh] min-h-[300px] rounded-2xl overflow-hidden group border border-border bg-slate-100 flex items-center justify-center text-slate-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-24 h-24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
        </div>
      )}

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 mt-8">

        <div className="flex flex-col gap-8 pb-10">
          <div>
            <h2 className="text-2xl font-semibold text-heading">
              {listing.property_type || "Unknown type"} in {listing.landmark || "Unknown location"}
            </h2>
            <p className="text-body mt-1">
              {listing.bedrooms ? `${listing.bedrooms} bedrooms` : "Unknown bedrooms"} · {listing.bathrooms ? `${listing.bathrooms} baths` : "Unknown baths"}
            </p>
          </div>

          <hr className="border-border" />

          {/* Hosted By — now a real link to the agent's public profile */}
          <Link
            href={`/agents/${listing.agent_id}`}
            className="flex items-center gap-4 hover:opacity-80 transition"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-border flex items-center justify-center text-heading font-bold text-lg">
              {listing.profiles?.avatar_url ? (
                <Image src={listing.profiles.avatar_url} alt={listing.profiles?.full_name ?? "Agent"} fill className="object-cover" />
              ) : (
                <span>{(listing.profiles?.full_name ?? "Agent").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-heading text-lg">Hosted by {listing.profiles?.full_name ?? "Unknown"}</h3>
              <p className="text-body text-sm underline">View profile</p>
            </div>
          </Link>

          <hr className="border-border" />

          <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-4 text-sm text-orange-900 flex gap-3 items-start">
            <span className="text-lg">⚠️</span>
            <p>
              <strong>Safety Warning:</strong> Do not pay any deposit or service fee until you have met the
              agent in person and verified what is being offered.
            </p>
          </div>

          <hr className="border-border" />

          {/* Room Features */}
          {(listing.is_self_contained || listing.has_shared_kitchen || listing.has_shared_bathroom) && (
            <>
              <div>
                <h3 className="text-xl font-semibold text-heading mb-4">Room Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.is_self_contained && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-mint/50 flex items-center justify-center text-primary">
                        🏠
                      </div>
                      <span className="text-body font-medium">Self Contained</span>
                    </div>
                  )}
                  {listing.has_shared_kitchen && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-mint/50 flex items-center justify-center text-primary">
                        🍳
                      </div>
                      <span className="text-body font-medium">Shared Kitchen</span>
                    </div>
                  )}
                  {listing.has_shared_bathroom && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-mint/50 flex items-center justify-center text-primary">
                        🚿
                      </div>
                      <span className="text-body font-medium">Shared Bathroom</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-border" />
            </>
          )}

          <div>
            <h3 className="text-xl font-semibold text-heading mb-4">About this space</h3>
            <div className="font-supporting text-body text-base leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </div>
          </div>

          <hr className="border-border" />

          <div>
            <h3 className="text-xl font-semibold text-heading mb-4">Reviews</h3>
            <ReviewsSection
              targetType="listing"
              targetId={listing.id}
              targetName={listing.title}
              initialReviews={reviews}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.user_metadata?.role ?? null}
            />
          </div>

        </div>

        <div className="relative">
          <div className="relative border border-border rounded-2xl p-6 shadow-xl bg-white flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-heading">
              GHS {listing.price.toLocaleString()} <span className="text-base font-normal text-body">/ mo</span>
            </h3>

            {/* Location Map */}
            {listing.latitude && listing.longitude ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-body">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{listing.landmark}{listing.city ? `, ${listing.city}` : ''}</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-border aspect-[4/3]">
                  <iframe
                    title="Listing location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.longitude - 0.01},${listing.latitude - 0.01},${listing.longitude + 0.01},${listing.latitude + 0.01}&layer=mapnik&marker=${listing.latitude},${listing.longitude}`}
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=16/${listing.latitude}/${listing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  View larger map
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.182a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.56l-5.22 5.22a.75.75 0 11-1.06-1.06l5.22-5.22h-1.69a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
                </a>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-slate-50 aspect-[4/3] flex items-center justify-center text-slate-300">
                <div className="text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-slate-400">Map unavailable</p>
                </div>
              </div>
            )}

            <ContactAgentButton
              agentId={listing.agent_id}
              phone={listing.profiles?.phone ?? null}
              email={listing.profiles?.email ?? null}
            />
            <RequestTourButton
              listingId={listing.id}
              agentId={listing.agent_id}
              existingTour={existingTour}
            />
            <p className="text-center text-sm text-body/70 mt-3">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </main>
  );
}