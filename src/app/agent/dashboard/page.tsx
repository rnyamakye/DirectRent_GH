import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import { ProfileCompletenessCard } from "@/components/profile-completeness-card";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { VerificationCard } from "@/components/dashboard/verification-card";

const SETTINGS_SECTIONS = [
  {
    href: "/agent/profile/personal",
    title: "Personal information",
    description: "Provide your legal name, address, phone number and emergency contact details.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/agent/profile/security",
    title: "Login & security",
    description: "Change your password, manage connected accounts, review active sessions and deactivate your account.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    href: "/agent/profile/notifications",
    title: "Notifications",
    description: "Choose what types of emails and alerts you want to receive from DirectRent.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/agent/profile/payments",
    title: "Payments & methods",
    description: "Add and manage your mobile money accounts and payment cards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/agent/wallet",
    title: "Wallet & Earnings",
    description: "Track your balance, view transactions, and request payouts.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
];

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
    { data: profile },
    { data: kycRequest },
    { data: listings },
    { count, error: viewsError },
    { data: reviewsData },
    { data: viewsData },
    { data: walletData },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, business_name, avatar_url, bio, location, languages, phone, is_verified").eq("id", user.id).single(),
    supabase.from("verification_requests").select("status, notes").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
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

  const completenessChecks = [
    !!profile?.business_name || !!profile?.full_name,
    !!profile?.bio,
    !!profile?.location,
    !!profile?.languages,
    !!profile?.phone,
  ];
  const completedCount = completenessChecks.filter(Boolean).length;
  const completenessPercent = Math.round((completedCount / completenessChecks.length) * 100);

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
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 pt-5 flex flex-col lg:flex-row gap-12 lg:items-start">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-8 lg:w-1/3 xl:w-1/4 lg:sticky lg:top-24">
        {/* Hero Header */}
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-mint flex items-center justify-center text-primary font-bold text-3xl shadow-md border-4 border-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.business_name ?? profile?.full_name ?? "Agent"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(profile?.business_name ?? profile?.full_name ?? "A").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-heading">
              Welcome, {profile?.business_name ?? profile?.full_name ?? "Agent"}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                Real Estate Agent
              </span>
              <span className="text-sm text-body/80">Manage your listings and track your performance.</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center w-full max-w-md">
            <Link
              href="/agent/profile/edit"
              className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
            >
              Edit profile
            </Link>
            <Link
              href="/agent/tours"
              className="flex items-center justify-center border border-primary text-primary hover:bg-primary/10 bg-card rounded-full px-5 py-2.5 text-sm font-bold transition"
            >
              View tours
            </Link>
            <Link
              href="/agent/listings/new"
              className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2.5 text-sm font-bold transition"
            >
              Create listing
            </Link>
          </div>
        </div>

        <ProfileCompletenessCard
          completenessPercent={completenessPercent}
          role="agent"
          className="w-full"
        />

        <VerificationCard 
          isVerified={profile?.is_verified ?? false}
          kycStatus={kycRequest?.status ?? null}
          kycNotes={kycRequest?.notes ?? null}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-12 lg:w-2/3 xl:w-3/4">

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
            <Link
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
            <Link
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
                    <Link href={`/listings/${listing.id}`} target="_blank" className="font-semibold text-heading truncate group-hover:text-primary transition-colors md:text-sm">
                      {listing.title}
                    </Link>
                    <p className="text-sm md:text-xs text-body/70 mt-1 md:mt-0.5 truncate">{listing.landmark || "No landmark specified"}</p>
                    <p className="text-sm font-semibold text-heading mt-2">
                      GHS {listing.price.toLocaleString()} <span className="font-normal text-body/70">/ mo</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-row gap-2 pr-2 sm:pr-4 md:pr-0 md:mt-3">
                    <Link
                      href={`/agent/listings/${listing.id}/edit`}
                      className="flex-1 flex items-center justify-center border border-border md:border-border/50 hover:border-heading/30 rounded-xl px-4 py-2 md:py-1.5 text-xs font-semibold transition whitespace-nowrap"
                    >
                      Edit
                    </Link>
                    <Link
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

      <hr className="border-border" />

      {/* Account Settings Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Account settings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SETTINGS_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-heading/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                {section.icon}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h2 className="text-base font-bold text-heading group-hover:text-primary transition-colors">{section.title}</h2>
                <p className="text-sm text-body/70 leading-relaxed">{section.description}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-body/50 group-hover:text-primary transition-colors">
                Manage
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      </div>
    </main>
  );
}
