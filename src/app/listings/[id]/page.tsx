import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaveButton } from "@/components/save-button";
import { ReviewsSection } from "@/components/reviews-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactAgentButton } from "@/components/contact-agent-button";

function ShareIcon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 2, overflow: 'visible' }}><g fill="none"><path d="M27 18v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9M16 3v23V3zM6 13l9.3-9.3a1 1 0 0 1 1.4 0L26 13"></path></g></svg>
  );
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, profiles!listings_agent_id_fkey(full_name, phone, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialSaved = false;
  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_listings")
      .select("*")
      .eq("renter_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    initialSaved = !!savedRow;
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
    reviewerName: r.profiles?.full_name ?? "Anonymous",
  }));

  const photos = listing.photo_urls || [];
  const displayPhotos = [...photos];
  while (displayPhotos.length < 5 && displayPhotos.length > 0) {
    displayPhotos.push(displayPhotos[0]);
  }

  const hasPhotos = displayPhotos.length > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Listings", href: "/listings" },
        { label: listing.title },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">{listing.title}</h1>
        <div className="flex items-center gap-4 text-sm font-semibold underline text-heading">
          <button className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition">
            <ShareIcon />
            Share
          </button>
          <div className="flex items-center gap-2 hover:bg-slate-100 rounded-lg transition">
            <SaveButton listingId={id} initialSaved={initialSaved} isLoggedIn={!!user} />
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {hasPhotos ? (
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[500px] md:h-[60vh] min-h-[400px] rounded-2xl overflow-hidden group">
          <div className="col-span-4 sm:col-span-2 row-span-2 relative">
            <img
              src={displayPhotos[0]}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
            />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <img src={displayPhotos[1]} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <img src={displayPhotos[2]} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <img src={displayPhotos[3]} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
          </div>
          <div className="hidden sm:block col-span-1 row-span-1 relative">
            <img src={displayPhotos[4]} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
            <button className="absolute bottom-4 right-4 bg-white border border-heading px-4 py-1.5 rounded-lg text-sm font-semibold text-heading shadow-md hover:bg-slate-50 transition flex items-center gap-2">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '12px', width: '12px', fill: 'currentColor' }}><path d="M14.33 2.67h-3V1.33h3c.74 0 1.34.6 1.34 1.34v3h-1.34v-3zM2.67 2.67v3H1.33v-3c0-.74.6-1.34 1.34-1.34h3v1.34h-3zm11.66 10.66v-3h1.34v3c0 .74-.6 1.34-1.34 1.34h-3v-1.34h3zm-11.66 0h3v1.34h-3c-.74 0-1.34-.6-1.34-1.34v-3h1.34v3z"></path></svg>
              Show all photos
            </button>
          </div>
        </div>
      ) : (
        <div className="h-[40vh] sm:h-[500px] md:h-[60vh] min-h-[300px] rounded-2xl overflow-hidden group border border-border">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" alt="Placeholder" className="w-full h-full object-cover" />
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
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-border flex items-center justify-center text-heading font-bold text-lg">
              <img src={listing.profiles?.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"} alt={listing.profiles?.full_name ?? "Agent"} className="w-full h-full object-cover" />
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
              initialReviews={reviews}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.user_metadata?.role ?? null}
            />
          </div>

        </div>

        <div className="relative">
          <div className="sticky top-28 border border-border rounded-2xl p-6 shadow-xl bg-white flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-heading">
              GHS {listing.price.toLocaleString()} <span className="text-base font-normal text-body">/ mo</span>
            </h3>

            <div className="border border-border rounded-lg overflow-hidden flex flex-col">
              <div className="flex border-b border-border">
                <div className="flex-1 p-3 border-r border-border hover:bg-slate-50 cursor-pointer">
                  <p className="text-[10px] font-bold uppercase text-heading">Check-in</p>
                  <p className="text-sm text-body mt-0.5">Add date</p>
                </div>
                <div className="flex-1 p-3 hover:bg-slate-50 cursor-pointer">
                  <p className="text-[10px] font-bold uppercase text-heading">Checkout</p>
                  <p className="text-sm text-body mt-0.5">Add date</p>
                </div>
              </div>
              <div className="p-3 hover:bg-slate-50 cursor-pointer">
                <p className="text-[10px] font-bold uppercase text-heading">Guests</p>
                <p className="text-sm text-body mt-0.5">1 guest</p>
              </div>
            </div>

            <ContactAgentButton 
              agentId={listing.agent_id} 
              phone={listing.profiles?.phone ?? null} 
            />
            <p className="text-center text-sm text-body/70">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </main>
  );
}