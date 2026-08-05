import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileCompletenessCard } from "@/components/profile-completeness-card";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, location, occupation, languages, fun_fact, interests, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  const completenessChecks = [
    !!profile?.avatar_url,
    !!profile?.bio,
    !!profile?.location,
    !!profile?.occupation,
  ];
  const completedCount = completenessChecks.filter(Boolean).length;
  const completenessPercent = Math.round((completedCount / completenessChecks.length) * 100);

  // Pull the full listing through the saved_listings join table.
  const { data: saved } = await supabase
    .from("saved_listings")
    .select("listing_id, listings(*)")
    .eq("renter_id", user.id)
    .limit(4);

  const savedListings = (saved ?? [])
    .map((row) => row.listings)
    .filter((listing) => listing !== null);

  const { data: savedProfilesData } = await supabase
    .from("saved_profiles")
    .select("profile_id")
    .eq("renter_id", user.id);

  const savedProfileIds = (savedProfilesData ?? []).map(r => r.profile_id);

  let savedAgents: any[] = [];
  let savedArtisans: any[] = [];

  if (savedProfileIds.length > 0) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, full_name, business_name, avatar_url, created_at")
      .eq("role", "agent")
      .in("id", savedProfileIds);

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

    const { data: artisanData } = await supabase
      .from("artisan_profiles")
      .select("*, profiles(full_name, avatar_url)")
      .in("id", savedProfileIds);

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

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

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
    <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 flex flex-col gap-12">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Dashboard" }
      ]} />
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-mint flex items-center justify-center text-primary font-bold text-4xl shadow-md border-4 border-white">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile?.full_name ?? "Renter"}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-heading">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-base text-body/80">
            Keep track of your favorite properties and find your next home.
          </p>
        </div>
        <div className="flex gap-3 justify-center mt-2">
          <Link
            href="/renter/profile/edit"
            className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
          >
            Edit profile
          </Link>
          <Link
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

      <hr className="border-border" />

      {/* Saved Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Saved</h2>
          {(savedListings.length > 0 || savedAgents.length > 0 || savedArtisans.length > 0) && (
            <Link
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
            <Link
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
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-mint/50 border border-border">
                    <img
                      src={hasPhoto ? listing.photo_urls[0] : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600"}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
              <Link
                key={agent.id}
                href={`/renters/${agent.id}`}
                className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-mint/50 border border-border">
                  <img
                    src={agent.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
                    alt={agent.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
              <Link
                key={artisan.id}
                href={`/artisans/${artisan.id}`}
                className="group flex flex-row items-center gap-4 bg-card rounded-2xl border border-border p-3 hover:shadow-md transition"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-mint/50 border border-border">
                  <img
                    src={artisan.photoUrl || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"}
                    alt={artisan.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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

      {/* Reviews Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-heading">Recent Reviews</h2>
          {enrichedRecentReviews.length > 0 && (
            <Link
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
                <Link
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

        <div className="pt-4 flex justify-start">
          <SignOutButton className="px-4 py-3 rounded-2xl border border-border bg-red-700 text-heading font-semibold hover:bg-red-600 text-white transition-colors shadow-sm">
            Sign out
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}