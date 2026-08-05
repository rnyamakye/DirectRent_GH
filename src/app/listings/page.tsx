import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listing-card";
import { AuthGuardLink } from "@/components/auth-guard-link";
import { ListingsFilter } from "@/components/listings-filter";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { area, minPrice, maxPrice } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("listings").select("*");

  if (area) query = query.ilike("landmark", `%${area}%`);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  const { data: listings } = await query.order("created_at", { ascending: false });

  // Fetch current user and their saved listings
  const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <main className="min-h-screen bg-canvas">
      {/* Horizontal Filter Bar */}
      <div className="bg-canvas/95 backdrop-blur-sm pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">

          <ListingsFilter area={area} minPrice={minPrice} maxPrice={maxPrice} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </main>
  );
}