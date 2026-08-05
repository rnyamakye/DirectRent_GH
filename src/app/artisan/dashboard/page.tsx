import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileCompletenessCard } from "@/components/profile-completeness-card";

const SETTINGS_SECTIONS = [
  {
    href: "/artisan/profile/personal",
    title: "Personal information",
    description: "Provide your legal name, address, phone number and emergency contact details.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/artisan/profile/security",
    title: "Login & security",
    description: "Change your password, manage connected accounts, review active sessions and deactivate your account.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    href: "/artisan/profile/notifications",
    title: "Notifications",
    description: "Choose what types of emails and alerts you want to receive from DirectRent.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/artisan/profile/payments",
    title: "Payments & methods",
    description: "Add and manage your mobile money accounts and payment cards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default async function ArtisanDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The route is already protected by middleware, so `user` should
  // always exist here — but TypeScript doesn't know that, and it's
  // good practice to handle it explicitly rather than assume.
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count, error: viewsError } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("target_id", user.id);
  const profileViewsCount = viewsError ? 0 : (count ?? 0);

  // No artisan_profiles row yet means they haven't filled in
  // /artisan/profile/edit at all — treat every field as "missing"
  // rather than erroring, so the dashboard still renders with a
  // 0% completeness bar prompting them to go fill it in.
  const completenessChecks = [
    !!artisanProfile?.bio,
    !!artisanProfile?.service_area,
    !!artisanProfile?.phone,
    !!artisanProfile?.services?.length,
    artisanProfile?.availability != null,
  ];
  const completedCount = completenessChecks.filter(Boolean).length;
  const completenessPercent = Math.round((completedCount / completenessChecks.length) * 100);

  const isBoosted =
    !!artisanProfile?.boosted_until && new Date(artisanProfile.boosted_until) > new Date();

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 flex flex-col gap-12">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Dashboard" }
      ]} />
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center text-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-mint flex items-center justify-center text-primary font-bold text-3xl shadow-md border-4 border-white">
          <img
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"}
            alt={profile?.full_name ?? "Artisan"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-heading">
            Welcome, {profile?.full_name ?? "Artisan"}
          </h1>
          <div className="flex flex-col flex-wrap justify-center items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {artisanProfile?.trade ?? "Trade not set yet"}
            </span>
            <span className="text-sm text-body/80">Manage your profile and performance.</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/artisan/profile/edit"
            className="flex items-center justify-center border border-border hover:border-heading/30 bg-card rounded-full px-5 py-2.5 text-sm font-semibold transition"
          >
            Edit profile
          </Link>
          <Link
            href="/artisan/boost"
            className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2.5 text-sm font-bold transition"
          >
            Boost profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-heading">{profileViewsCount}</p>
          <p className="text-sm font-medium text-body/70">Profile Views</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1 opacity-60">
          <p className="text-3xl font-bold text-heading">—</p>
          <p className="text-sm font-medium text-body/70">Avg Rating</p>
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
        {completenessPercent < 100 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-1">
            <p className="text-3xl font-bold text-heading">{completenessPercent}%</p>
            <p className="text-sm font-medium text-body/70">Profile Completeness</p>
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Main Content Columns */}
      <div className={`grid grid-cols-1 ${completenessPercent < 100 ? 'lg:grid-cols-2' : ''} gap-12`}>
        {/* Left Column: Completeness & Quick Actions */}
        <ProfileCompletenessCard
          completenessPercent={completenessPercent}
          role="artisan"
          isArtisanLayout={true}
        />

        {/* Right Column: Reviews */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold text-heading mb-6">Recent reviews</h2>
            <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-heading mb-2">No reviews yet</p>
              <p className="text-sm text-body/70 max-w-sm">
                When clients review your work, their feedback will appear here to help you build your reputation.
              </p>
            </div>
          </div>
        </div>
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
          <SignOutButton className="px-4 py-3 rounded-2xl border border-border bg-red-700 font-semibold hover:bg-red-600 text-white transition-colors shadow-sm">
            Sign out
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}