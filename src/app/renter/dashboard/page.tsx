import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import { ProfileCompletenessCard } from "@/components/profile-completeness-card";
import { RecentlyViewedSection } from "@/components/recently-viewed-section";

const SETTINGS_SECTIONS = [
  {
    href: "/renter/profile/personal",
    title: "Personal information",
    description: "Provide your legal name, address, phone number and emergency contact details.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/renter/profile/security",
    title: "Login & security",
    description: "Change your password, manage connected accounts, review active sessions and deactivate your account.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    href: "/renter/profile/notifications",
    title: "Notifications",
    description: "Choose what types of emails and alerts you want to receive from DirectRent.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/renter/profile/payments",
    title: "Payments & methods",
    description: "Add and manage your mobile money accounts and payment cards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default async function RenterDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: profile },
    { data: saved },
    { data: savedProfilesData },
    { data: recentReviews },
    { data: bookings }
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, bio, location, occupation, languages, fun_fact, interests, avatar_url, created_at").eq("id", user.id).single(),
    supabase.from("saved_listings").select("listing_id, listings(*)").eq("renter_id", user.id).limit(4),
    supabase.from("saved_profiles").select("profile_id").eq("renter_id", user.id),
    supabase.from("reviews").select("*").eq("reviewer_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("bookings").select(`
      id,
      artisan_id,
      booking_date,
      booking_time,
      location,
      status,
      created_at,
      artisan_profiles!bookings_artisan_id_fkey (
        trade,
        profiles!artisan_profiles_id_fkey (
          full_name,
          avatar_url
        )
      )
    `).eq("renter_id", user.id).order("created_at", { ascending: false }).limit(4)
  ]);

  const completenessChecks = [
    !!profile?.avatar_url,
    !!profile?.bio,
    !!profile?.location,
    !!profile?.occupation,
  ];
  const completedCount = completenessChecks.filter(Boolean).length;
  const completenessPercent = Math.round((completedCount / completenessChecks.length) * 100);

  const savedListings = (saved ?? [])
    .map((row) => row.listings as any)
    .filter((listing) => listing !== null);

  const savedProfileIds = (savedProfilesData ?? []).map(r => r.profile_id);

  let savedAgents: any[] = [];
  let savedArtisans: any[] = [];

  if (savedProfileIds.length > 0) {
    const [
      { data: agentData },
      { data: artisanData }
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, business_name, avatar_url, created_at").eq("role", "agent").in("id", savedProfileIds),
      supabase.from("artisan_profiles").select("*, profiles(full_name, avatar_url)").in("id", savedProfileIds)
    ]);

    savedAgents = (agentData ?? []).map((row: any) => ({
      id: row.id,
      fullName: row.id === user.id ? "You" : row.full_name,
      businessName: row.id === user.id ? "You" : row.business_name,
      avatarUrl: row.avatar_url,
      averageRating: null,
      reviewCount: 0,
      activeListingsCount: 0,
      memberSince: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      isSaved: true,
    }));

    savedArtisans = (artisanData ?? []).map((row: any) => ({
      id: row.id,
      name: row.id === user.id ? "You" : (row.profiles?.full_name ?? "Artisan"),
      trade: row.trade,
      area: row.service_area ?? "",
      bio: row.bio ?? "",
      photoUrl: row.profiles?.avatar_url ?? row.photo_urls?.[0] ?? null,
      available: row.availability === "available",
      isBoosted: !!row.boosted_until && new Date(row.boosted_until) > new Date(),
      averageRating: null,
      reviewCount: 0,
      isSaved: true,
    }));
  }

  const listingIds = (recentReviews ?? []).filter((r) => r.target_type === "listing").map((r) => r.target_id);
  const artisanIds = (recentReviews ?? []).filter((r) => r.target_type === "artisan").map((r) => r.target_id);
  const agentIds = (recentReviews ?? []).filter((r) => r.target_type === "agent").map((r) => r.target_id);

  const { data: listings } = listingIds.length > 0 ? await supabase.from("listings").select("id, title").in("id", listingIds) : { data: [] };
  const { data: artisans } = artisanIds.length > 0 ? await supabase.from("artisan_profiles").select("id, profiles(full_name)").in("id", artisanIds) : { data: [] };
  const { data: agents } = agentIds.length > 0 ? await supabase.from("profiles").select("id, full_name").in("id", agentIds) : { data: [] };

  const enrichedRecentReviews = (recentReviews ?? []).map((review) => {
    let targetName = "No longer available";
    if (review.target_type === "listing") {
      targetName = listings?.find((l) => l.id === review.target_id)?.title ?? targetName;
    } else if (review.target_type === "artisan") {
      targetName = (artisans?.find((a) => a.id === review.target_id) as any)?.profiles?.full_name ?? targetName;
    } else {
      targetName = agents?.find((a) => a.id === review.target_id)?.full_name ?? targetName;
    }
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      targetType: review.target_type,
      targetId: review.target_id,
      targetName,
    };
  });

  const initials = (profile?.full_name || "U").charAt(0).toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  const profileDetails = [
    { emoji: "💼", label: "Works as", value: profile?.occupation },
    { emoji: "📍", label: "Lives in", value: profile?.location },
    { emoji: "🌍", label: "Languages", value: profile?.languages },
    { emoji: "⚡", label: "Fun fact", value: profile?.fun_fact },
  ].filter((d) => d.value);

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 pt-5 flex flex-col lg:flex-row gap-12 lg:items-start">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-8 lg:w-1/3 xl:w-1/4  lg:top-24">
        {/* Profile Card */}
        <div className="flex flex-col items-center gap-5">
          <div className="bg-white rounded-3xl p-8 border border-border/50 flex flex-col items-center text-center w-full max-w-md">
            {/* Avatar with pencil edit button */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-mint flex items-center justify-center text-4xl text-primary font-bold">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name ?? "Renter"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              {/* Pencil edit icon */}
              <Link prefetch={false}
                href="/renter/profile/edit"
                className="absolute bottom-0.5 right-0.5 w-8 h-8 bg-white border border-border rounded-full shadow-md flex items-center justify-center text-heading hover:bg-primary hover:text-white hover:border-primary transition"
                title="Edit profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z" />
                </svg>
              </Link>
            </div>

            <h1 className="text-3xl font-extrabold text-heading mt-5">{profile?.full_name ?? "Renter"}</h1>
            <div className="flex items-center gap-1 font-bold text-sm text-heading mt-1">
              <span className="uppercase tracking-widest text-primary">Renter</span>
            </div>
          </div>

          {/* Action buttons — outside the card */}
          <div className="flex flex-wrap gap-3 justify-center w-full max-w-md">
            <Link prefetch={false}
              href="/renter/tours"
              className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
            >
              My Tours
            </Link>
            <Link prefetch={false}
              href="/renter/alerts"
              className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
            >
              Search Alerts
            </Link>
            <Link prefetch={false}
              href="/listings"
              className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2.5 text-sm font-bold transition"
            >
              Explore listings
            </Link>
          </div>
        </div>


        <ProfileCompletenessCard
          completenessPercent={completenessPercent}
          role="renter"
          className="max-w-2xl mx-auto w-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-12 lg:w-2/3 xl:w-3/4">
        {/* Recent Bookings Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-heading">Recent Bookings</h2>
            {bookings && bookings.length > 0 && (
              <Link prefetch={false} href="/renter/bookings" className="text-sm font-semibold text-primary hover:text-primary-hover transition">
                View all →
              </Link>
            )}
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
              <p className="text-lg font-semibold text-heading">No bookings yet</p>
              <p className="text-body/70 max-w-sm text-sm">When you request a service from an artisan, you can track it here.</p>
              <Link prefetch={false} href="/artisans" className="mt-2 bg-heading hover:bg-black text-white rounded-full px-6 py-2.5 text-sm font-bold transition">
                Find an Artisan
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bookings.map((booking: any) => {
                const artisanProfile = booking.artisan_profiles?.profiles;
                const artisanName = artisanProfile?.full_name || "Unknown Artisan";
                const trade = booking.artisan_profiles?.trade || "Service";
                const statusColors = {
                  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  confirmed: "bg-green-100 text-green-800 border-green-200",
                  completed: "bg-blue-100 text-blue-800 border-blue-200",
                  cancelled: "bg-red-100 text-red-800 border-red-200",
                };
                const badgeColor = statusColors[booking.status as keyof typeof statusColors] || "bg-slate-100 text-slate-800 border-slate-200";

                return (
                  <div key={booking.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-border/50">
                          {artisanProfile?.avatar_url ? (
                            <img src={artisanProfile.avatar_url} alt={artisanName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                              {artisanName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-heading text-sm sm:text-base line-clamp-1">{artisanName}</p>
                          <p className="text-xs text-body/80 font-medium">{trade}</p>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Saved Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-heading">Saved</h2>
            {(savedListings.length > 0 || savedAgents.length > 0 || savedArtisans.length > 0) && (
              <Link prefetch={false}
                href="/renter/saved"
                className="text-sm font-semibold text-primary hover:text-primary-hover transition"
              >
                View all →
              </Link>
            )}
          </div>

          {savedListings.length === 0 && savedAgents.length === 0 && savedArtisans.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
              <p className="text-lg font-semibold text-heading">Nothing saved yet</p>
              <p className="text-body/70 max-w-sm text-sm">
                When you see a property, agent, or artisan you like, click the heart icon to save it here for easy access later.
              </p>
              <Link prefetch={false}
                href="/listings"
                className="mt-2 bg-heading hover:bg-black text-white rounded-full px-6 py-2.5 text-sm font-bold transition"
              >
                Start browsing
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedListings.map((listing) => {
                const hasPhoto = listing.photo_urls && listing.photo_urls.length > 0;
                return (
                  <Link prefetch={false}
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
                  >
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
                      {hasPhoto ? (
                        <img
                          src={listing.photo_urls[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-heading truncate group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-body/70 mt-1 truncate">{listing.landmark || "Location not specified"}</p>
                      <p className="text-sm font-semibold text-heading mt-2">
                        GHS {listing.price.toLocaleString()} <span className="font-normal text-body/70">/ mo</span>
                      </p>
                    </div>

                    <div className="hidden sm:flex pr-4">
                      <span className="bg-white p-2 border border-border rounded-full shadow-sm text-accent group-hover:bg-accent/10 transition">
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'currentColor', height: '16px', width: '16px' }}><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94C20.45 4.06 18 6 16 8c-2-2-4.45-3.94-7-3.94A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path></svg>
                      </span>
                    </div>
                  </Link>
                );
              })}

              {savedAgents.slice(0, 4).map(agent => (
                <Link prefetch={false}
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border border-border bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                    {agent.avatarUrl ? (
                      <img
                        src={agent.avatarUrl}
                        alt={agent.fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span>{agent.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-heading truncate group-hover:text-primary transition-colors">
                      {agent.fullName}
                    </h3>
                    <p className="text-sm text-body/70 mt-1 truncate">{agent.businessName || "Real Estate Agent"}</p>
                    <p className="text-sm font-semibold text-heading mt-2">
                      Agent <span className="font-normal text-body/70">· Member since {agent.memberSince}</span>
                    </p>
                  </div>

                  <div className="hidden sm:flex pr-4">
                    <span className="bg-white p-2 border border-border rounded-full shadow-sm text-accent group-hover:bg-accent/10 transition">
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'currentColor', height: '16px', width: '16px' }}><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94C20.45 4.06 18 6 16 8c-2-2-4.45-3.94-7-3.94A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path></svg>
                    </span>
                  </div>
                </Link>
              ))}

              {savedArtisans.slice(0, 4).map(artisan => (
                <Link prefetch={false}
                  key={artisan.id}
                  href={`/artisans/${artisan.id}`}
                  className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border border-border bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                    {artisan.photoUrl ? (
                      <img
                        src={artisan.photoUrl}
                        alt={artisan.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span>{artisan.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-heading truncate group-hover:text-primary transition-colors">
                      {artisan.name}
                    </h3>
                    <p className="text-sm text-body/70 mt-1 truncate">{artisan.trade} {artisan.area && `· ${artisan.area}`}</p>
                    <p className="text-sm font-semibold text-heading mt-2">
                      Artisan <span className="font-normal text-body/70">· {artisan.available ? 'Available' : 'Unavailable'}</span>
                    </p>
                  </div>

                  <div className="hidden sm:flex pr-4">
                    <span className="bg-white p-2 border border-border rounded-full shadow-sm text-accent group-hover:bg-accent/10 transition">
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'currentColor', height: '16px', width: '16px' }}><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94C20.45 4.06 18 6 16 8c-2-2-4.45-3.94-7-3.94A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Recently Viewed Section */}
        <RecentlyViewedSection userId={user.id} />


        {/* Reviews Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-heading">Recent Reviews</h2>
            {enrichedRecentReviews.length > 0 && (
              <Link prefetch={false}
                href="/renter/reviews"
                className="text-sm font-semibold text-primary hover:text-primary-hover transition"
              >
                View all →
              </Link>
            )}
          </div>

          {enrichedRecentReviews.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
              <p className="text-lg font-semibold text-heading">No reviews yet</p>
              <p className="text-body/70 max-w-sm text-sm">
                You haven't left any reviews for properties or professionals yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichedRecentReviews.map((review) => (
                <div key={review.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-3 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {review.targetType}
                    </span>
                    <div className="flex text-saffron text-sm">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-heading truncate">{review.targetName}</h3>
                  <p className="text-sm text-body/80 line-clamp-3 italic">
                    "{review.comment}"
                  </p>
                  <Link prefetch={false}
                    href={`/${review.targetType === 'listing' ? 'listings' : review.targetType + 's'}/${review.targetId}`}
                    className="mt-auto text-sm font-semibold text-primary hover:underline"
                  >
                    View {review.targetType}
                  </Link>
                </div>
              ))}
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
              <Link prefetch={false}
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