import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export async function RecentlyViewedSection({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("recently_viewed_listings")
    .select("listing_id, viewed_at, listings(*)")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(6);

  const recentlyViewed = (data ?? [])
    .map((row) => ({
      listing: row.listings,
      viewedAt: new Date(row.viewed_at),
    }))
    .filter((item) => item.listing !== null);

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <>
      <hr className="border-border" />
      <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-heading">Recently Viewed</h2>
      </div>

      <div className="flex flex-col gap-4">
        {recentlyViewed.map(({ listing, viewedAt }) => {
          const l = listing as any;
          const hasPhoto = l.photo_urls && l.photo_urls.length > 0;
          return (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
                {hasPhoto ? (
                  <img
                    src={l.photo_urls[0]}
                    alt={l.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                )}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-heading truncate group-hover:text-primary transition-colors">
                  {l.title}
                </h3>
                <p className="text-sm text-body/70 mt-1 truncate">{l.landmark || "Location not specified"}</p>
                <p className="text-sm font-semibold text-heading mt-2">
                  GHS {l.price.toLocaleString()} <span className="font-normal text-body/70">/ mo</span>
                </p>
              </div>

              <div className="hidden sm:flex pr-4">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-body/70">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {timeAgo(viewedAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </>
  );
}
