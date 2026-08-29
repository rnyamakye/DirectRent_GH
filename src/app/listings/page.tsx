import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import { AuthGuardLink } from "@/components/auth-guard-link";
import { ListingsFilter } from "@/components/listings-filter";
import { MapLoader } from "@/components/map-loader";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; minPrice?: string; maxPrice?: string; selfContained?: string; sharedKitchen?: string; sharedBathroom?: string }>;
}) {
  const { area, minPrice, maxPrice, selfContained, sharedKitchen, sharedBathroom } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/listings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "agent") {
    redirect("/agent/dashboard");
  }

  if (profile?.role === "artisan") {
    redirect("/artisan/dashboard");
  }

  let query = supabase.from("listings").select("*");

  if (area) query = query.ilike("landmark", `%${area}%`);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (selfContained === "1") query = query.eq("is_self_contained", true);
  if (sharedKitchen === "1") query = query.eq("has_shared_kitchen", true);
  if (sharedBathroom === "1") query = query.eq("has_shared_bathroom", true);

  const { data: listings } = await query
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const isLoggedIn = !!user;

  let savedListingIds = new Set<string | number>();
  if (user && listings && listings.length > 0) {
    const listingIds = listings.map(l => l.id);
    const { data: savedListings } = await supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("renter_id", user.id)
      .in("listing_id", listingIds);

    if (savedListings) {
      savedListingIds = new Set(savedListings.map(s => s.listing_id));
    }
  }

  const mapListings = listings?.map(l => ({
    id: String(l.id),
    lat: Number(l.latitude),
    lng: Number(l.longitude),
    title: l.title,
    price: l.price,
    photoUrl: l.photo_urls?.[0]
  })).filter(l => !isNaN(l.lat) && !isNaN(l.lng) && l.lat !== 0 && l.lng !== 0) || [];

  return (
    <main className="min-h-screen bg-canvas flex flex-col max-w-7xl mx-auto">
      {/* Horizontal Filter Bar */}
      <div className="bg-canvas/95 backdrop-blur-sm pt-8 pb-4 border-b border-border relative top-0 z-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <ListingsFilter area={area} minPrice={minPrice} maxPrice={maxPrice} selfContained={selfContained} sharedKitchen={sharedKitchen} sharedBathroom={sharedBathroom} mapListings={mapListings} />
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative">

          {/* Listings Grid */}
          <div className="w-full lg:w-3/5 xl:w-2/3">
            {!listings || listings.length === 0 ? (
              <div className="py-24 text-center rounded-3xl border border-border bg-card">
                <p className="text-lg font-semibold text-heading">No listings match your search.</p>
                <p className="mt-1 text-sm text-body/60">Try a different area or price range.</p>
                {(area || minPrice || maxPrice) && (
                  <Link href="/listings" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover">
                    Reset filters
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const isBoosted = listing.boosted_until && new Date(listing.boosted_until) > new Date();
                  const isNew = listing.created_at && new Date(listing.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  const isUnavailable = listing.status !== "available";

                  return (
                    <AuthGuardLink key={listing.id} href={`/listings/${listing.id}`} className="block">
                      <ListingCard
                        initialSaved={savedListingIds.has(listing.id)}
                        isLoggedIn={isLoggedIn}
                        listing={{
                          id: listing.id,
                          title: listing.title,
                          area: listing.landmark || "Unknown Location",
                          price: listing.price,
                          unit: "/ mo",
                          image: listing.photo_urls?.[0] || undefined,
                          isBoosted: isBoosted,
                          isNew: isNew,
                          isUnavailable: isUnavailable,
                        }}
                      />
                    </AuthGuardLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map Container — hidden on mobile (shown inside filter dropdown instead) */}
          <div className="hidden lg:block lg:w-2/5 xl:w-1/3 h-[400px] lg:h-[calc(100vh-140px)] lg:relative rounded-2xl overflow-hidden shadow-sm z-10 border border-border bg-card">
            <MapLoader listings={mapListings} />
          </div>

        </div>
      </div>
    </main>
  );
}