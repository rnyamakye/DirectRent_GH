import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileCompletenessCard } from "@/components/profile-completeness-card";

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
];

export default async function AgentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name, avatar_url, bio, location, languages, phone")
    .eq("id", user.id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const { count, error: viewsError } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("target_id", user.id);
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

  return (
    <div className="flex flex-col gap-12">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Dashboard" }
      ]} />
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-mint flex items-center justify-center text-primary font-bold text-3xl shadow-md border-4 border-white">
          <img
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
            alt={profile?.business_name ?? profile?.full_name ?? "Agent"}
            className="w-full h-full object-cover"
          />
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
        <div className="flex gap-3 justify-center">
          <Link
            href="/agent/profile/edit"
            className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
          >
            Edit profile
          </Link>
          <Link
            href="/agent/listings/new"
            className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2.5 text-sm font-bold transition"
          >
            Create listing
          </Link>
        </div>
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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1 opacity-60">
          <p className="text-3xl font-bold text-heading">—</p>
          <p className="text-sm font-medium text-body/70">Avg Rating</p>
        </div>
      </div>

      <ProfileCompletenessCard
        completenessPercent={completenessPercent}
        role="agent"
        className="max-w-2xl mx-auto w-full"
      />

      <hr className="border-border" />

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
        </div><div className="pt-4 flex justify-start">
          <SignOutButton className="px-4 py-3 rounded-2xl border border-border bg-red-700 text-heading font-semibold hover:bg-red-600 text-white transition-colors shadow-sm">
            Sign out
          </SignOutButton>
        </div>
      </div>

    </div>
  );
}
