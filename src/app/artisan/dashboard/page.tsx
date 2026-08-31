import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";

export default async function ArtisanDashboardPage() {
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
    { data: artisanProfile },
    { count, error: viewsError },
    { data: reviewsData },
    { data: viewsData },
    { data: walletData },
    { data: rawBookings },
  ] = await Promise.all([
    supabase.from("artisan_profiles").select("*").eq("id", user.id).single(),
    supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("target_id", user.id),
    supabase.from("reviews").select("rating").eq("target_type", "artisan").eq("target_id", user.id),
    supabase.from("profile_views").select("created_at").eq("target_id", user.id).gte("created_at", thirtyDaysAgoISO),
    supabase.from("wallets").select("id").eq("user_id", user.id).single(),
    supabase.from("bookings").select(`
      id,
      renter_id,
      booking_date,
      booking_time,
      location,
      status,
      created_at
    `).eq("artisan_id", user.id).order("created_at", { ascending: false }).limit(4)
  ]);

  let bookings = rawBookings || [];
  if (bookings.length > 0) {
    const renterIds = [...new Set(bookings.map((b) => b.renter_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", renterIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    
    // Attach profile to each booking to match expected shape
    for (const booking of bookings) {
      (booking as any).profiles = profileMap.get(booking.renter_id) || null;
    }
  }

  const profileViewsCount = viewsError ? 0 : (count ?? 0);

  const isBoosted =
    !!artisanProfile?.boosted_until && new Date(artisanProfile.boosted_until) > new Date();

  // --- Analytics Data Fetching ---

  // 1. Average Rating
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
        <p className="text-base text-body/80">Track your performance and analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">{profileViewsCount}</p>
          <p className="text-sm font-medium text-body/70">Profile Views</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">
            {isBoosted ? (
              <span className="text-emerald-600">Active</span>
            ) : (
              <span className="text-body/50">Inactive</span>
            )}
          </p>
          <p className="text-sm font-medium text-body/70">Boost Status</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1 opacity-100">
          <p className="text-3xl font-bold text-heading">{avgRatingStr}</p>
          <p className="text-sm font-medium text-body/70">Avg Rating</p>
        </div>
        <Link prefetch={false} href="/artisan/reviews" className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1 hover:shadow-md hover:border-primary/50 transition cursor-pointer group">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-heading group-hover:text-primary transition-colors">{reviewsData?.length ?? 0}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-body/30 group-hover:text-primary transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          <p className="text-sm font-medium text-body/70">Total Reviews</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Recent Bookings</h2>
          {bookings && bookings.length > 0 && (
            <Link prefetch={false} href="/artisan/bookings" className="text-sm font-semibold text-primary hover:text-primary-hover transition">
              View all →
            </Link>
          )}
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-semibold text-heading">No bookings yet</p>
            <p className="text-sm text-body/70 max-w-sm">
              When clients book your services, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookings.map((booking: any) => {
              const renterProfile = booking.profiles;
              const renterName = renterProfile?.full_name || "Unknown Renter";
              const statusColors = {
                pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                confirmed: "bg-green-100 text-green-800 border-green-200",
                completed: "bg-blue-100 text-blue-800 border-blue-200",
                cancelled: "bg-red-100 text-red-800 border-red-200",
              };
              const badgeColor = statusColors[booking.status as keyof typeof statusColors] || "bg-slate-100 text-slate-800 border-slate-200";

              return (
                <Link prefetch={false} key={booking.id} href={`/artisan/bookings`} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-border/50">
                        {renterProfile?.avatar_url ? (
                          <img src={renterProfile.avatar_url} alt={renterName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                            {renterName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-heading text-sm sm:text-base line-clamp-1">{renterName}</p>
                        <p className="text-xs text-body/80 font-medium">Client</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${badgeColor}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-1">
                    <div className="bg-slate-50 border border-border/50 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-body/60 font-bold uppercase tracking-widest">Date & Time</span>
                      <span className="font-semibold text-heading truncate">{new Date(booking.booking_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {booking.booking_time}</span>
                    </div>
                    <div className="bg-slate-50 border border-border/50 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-[10px] text-body/60 font-bold uppercase tracking-widest">Location</span>
                      <span className="font-semibold text-heading truncate" title={booking.location}>{booking.location}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Analytics Charts */}
      <AnalyticsCharts data={chartData} />


    </main>
  );
}