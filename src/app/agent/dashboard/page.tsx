import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";

export default async function AgentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  const [
    { data: listings },
    { count, error: viewsError },
    { data: reviewsData },
    { data: viewsData },
    { data: walletData },
  ] = await Promise.all([
    supabase.from("listings").select("*").eq("agent_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("target_id", user.id),
    supabase.from("reviews").select("rating").eq("target_type", "agent").eq("target_id", user.id),
    supabase.from("profile_views").select("created_at").eq("target_id", user.id).gte("created_at", thirtyDaysAgoISO),
    supabase.from("wallets").select("id").eq("user_id", user.id).single(),
  ]);

  const profileViewsCount = viewsError ? 0 : (count ?? 0);

  const myListings = listings ?? [];
  const activeBoosts = myListings.filter(
    (l) => l.boosted_until && new Date(l.boosted_until) > new Date()
  ).length;

  let avgRatingStr = "—";
  if (reviewsData && reviewsData.length > 0) {
    const sum = reviewsData.reduce((acc, row) => acc + row.rating, 0);
    const avg = sum / reviewsData.length;
    avgRatingStr = avg.toFixed(1);
  }

  let txData: any[] = [];
  if (walletData?.id) {
    const { data: txs } = await supabase
      .from("wallet_transactions")
      .select("amount_pesewas, created_at")
      .eq("wallet_id", walletData.id)
      .eq("type", "credit")
      .gte("created_at", thirtyDaysAgoISO);
    
    txData = txs ?? [];
  }

  // Aggregate into daily buckets
  const chartDataMap = new Map<string, { views: number; earnings: number }>();
  
  // Pre-fill last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    chartDataMap.set(dateStr, { views: 0, earnings: 0 });
  }

  if (viewsData) {
    viewsData.forEach(row => {
      const dateStr = new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (chartDataMap.has(dateStr)) {
        chartDataMap.get(dateStr)!.views += 1;
      }
    });
  }

  if (txData.length > 0) {
    txData.forEach(row => {
      const dateStr = new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (chartDataMap.has(dateStr)) {
        chartDataMap.get(dateStr)!.earnings += (row.amount_pesewas / 100);
      }
    });
  }

  const chartData = Array.from(chartDataMap.entries()).map(([date, metrics]) => ({
    date,
    views: metrics.views,
    earnings: Number(metrics.earnings.toFixed(2)),
  }));

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 pt-5 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Dashboard</h1>
        <p className="text-base text-body/80">Track your performance, listings, and analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">{myListings.length}</p>
          <p className="text-sm font-medium text-body/70">Total Listings</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">{profileViewsCount}</p>
          <p className="text-sm font-medium text-body/70">Profile Views</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">{activeBoosts}</p>
          <p className="text-sm font-medium text-body/70">Active Boosts</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1 opacity-100">
          <p className="text-3xl font-bold text-heading">{avgRatingStr}</p>
          <p className="text-sm font-medium text-body/70">Avg Rating</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts data={chartData} />

      {/* Listings Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">My listings</h2>
          {myListings.length > 0 && (
            <Link prefetch={false}
              href="/agent/listings"
              className="text-sm font-semibold text-primary hover:text-primary-hover transition"
            >
              View all →
            </Link>
          )}
        </div>

        {myListings.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-semibold text-heading">No listings yet</p>
            <p className="text-body/70 max-w-sm text-sm">
              Start by creating your first property listing to reach potential renters across Ghana.
            </p>
            <Link prefetch={false}
              href="/agent/listings/new"
              className="mt-2 bg-heading hover:bg-black text-white rounded-full px-6 py-2.5 text-sm font-bold transition"
            >
              Add your first listing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myListings.slice(0, 4).map((listing) => {
              const boosted =
                !!listing.boosted_until && new Date(listing.boosted_until) > new Date();
              const hasPhoto = listing.photo_urls && listing.photo_urls.length > 0;
              return (
                <div
                  key={listing.id}
                  className="group flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 bg-card md:bg-transparent rounded-2xl border border-border md:border-none p-3 md:p-0 hover:shadow-md md:hover:shadow-none transition"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-full md:h-auto md:aspect-square flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-mint/50 border border-border md:border-none">
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
                    <span className={`absolute top-2 right-2 md:top-3 md:right-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm ${listing.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-white/90 text-body"
                      }`}>
                      {listing.status}
                    </span>
                  </div>

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

    </main>
  );
}
