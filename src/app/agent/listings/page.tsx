import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AgentListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const myListings = listings ?? [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-heading">My Listings</h1>
          <p className="text-body/80 mt-1">Manage and track your property listings.</p>
        </div>
        <Link prefetch={false}
          href="/agent/listings/new"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2.5 text-sm font-bold transition whitespace-nowrap"
        >
          Create listing
        </Link>
      </div>

      <hr className="border-border" />

      {myListings.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-heading">No listings yet</p>
          <p className="text-body/70 max-w-sm text-sm">
            Start by creating your first property listing to reach potential renters across Ghana.
          </p>
          <Link prefetch={false}
            href="/agent/listings/new"
            className="mt-2 bg-heading hover:bg-black dark:hover:bg-slate-300 text-white dark:text-slate-900 rounded-full px-6 py-2.5 text-sm font-bold transition"
          >
            Add your first listing
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myListings.map((listing) => {
            const boosted =
              !!listing.boosted_until && new Date(listing.boosted_until) > new Date();
            const hasPhoto = listing.photo_urls && listing.photo_urls.length > 0;
            return (
              <div
                key={listing.id}
                className="group flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 bg-card md:bg-transparent rounded-2xl border border-border md:border-none p-3 md:p-0 hover:shadow-md md:hover:shadow-none transition"
              >
                <Link 
                  prefetch={false} 
                  href={`/listings/${listing.id}`} 
                  target="_blank"
                  className="relative block w-24 h-24 sm:w-32 sm:h-32 md:w-full md:h-auto md:aspect-square flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-mint/50 border border-border md:border-none"
                >
                  {hasPhoto ? (
                    <img
                      src={listing.photo_urls[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-body/40 text-sm font-medium">
                      No photo
                    </div>
                  )}
                  {boosted && (
                    <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-saffron text-heading text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
                      Boosted
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 md:top-3 md:right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm ${listing.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-card/90 text-body"
                    }`}>
                    {listing.status}
                  </span>
                </Link>

                <div className="flex flex-col flex-1 min-w-0 md:mt-3">
                  <Link prefetch={false} href={`/listings/${listing.id}`} target="_blank" className="font-semibold text-heading truncate group-hover:text-primary transition-colors md:text-sm">
                    {listing.title}
                  </Link>
                  <p className="text-sm md:text-xs text-body/70 mt-1 md:mt-0.5 truncate">{listing.landmark || "No landmark specified"}</p>
                  <p className="text-sm font-semibold text-heading mt-2">
                    GHS {listing.price.toLocaleString()} <span className="font-normal text-body/70">/ mo</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-row gap-2 pr-2 sm:pr-4 md:pr-0 md:mt-3">
                  <Link prefetch={false}
                    href={`/agent/listings/${listing.id}/edit`}
                    className="flex-1 flex items-center justify-center border border-border md:border-border/50 hover:border-heading/30 rounded-xl px-4 py-2 md:py-1.5 text-xs font-semibold transition whitespace-nowrap"
                  >
                    Edit
                  </Link>
                  <Link prefetch={false}
                    href={`/agent/listings/${listing.id}/boost`}
                    className="flex-1 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-4 py-2 md:py-1.5 text-xs font-semibold transition whitespace-nowrap"
                  >
                    Boost
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
