import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileCompletenessCard } from "@/components/profile-completeness-card";
import { ThemePreferenceCard } from "@/components/theme-preference-card";
const SETTINGS_SECTIONS = [
  {
    href: "/agent/profile/verification",
    title: "Identity verification",
    description: "Upload identity documents to earn a verified badge.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </svg>
    ),
  },
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

export default async function AgentProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: profile },
    { data: kycRequest },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, business_name, avatar_url, bio, location, languages, phone, is_verified").eq("id", user.id).single(),
    supabase.from("verification_requests").select("status, notes").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Profile & Settings</h1>
        <p className="text-base text-body/80">Manage your identity, verification, and account settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:items-start w-full">
        {/* Left Column: Avatar & Completeness */}
        <div className="flex flex-col gap-8 w-full lg:w-2/4">
          {/* Hero Header */}
          <div className="rounded-3xl  bg-card p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
            <div className="relative">
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
              <Link prefetch={false}
                href="/agent/profile/edit"
                className="absolute bottom-0.5 right-0.5 w-8 h-8 bg-card border border-border rounded-full shadow-md flex items-center justify-center text-heading hover:bg-primary hover:text-white hover:border-primary transition"
                title="Edit profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z" />
                </svg>
              </Link>
            </div>

            <div className="flex flex-col gap-2 items-center mt-2">
              <h2 className="text-2xl font-bold text-heading">
                {profile?.business_name ?? profile?.full_name ?? "Agent"}
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-primary">
                  Real Estate Agent
                </span>
              </div>
            </div>
          </div>

          {/* Personal Details Card */}
          {(profile?.phone || profile?.location || profile?.languages || profile?.bio) && (
            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-3.5 shadow-sm text-sm">
              <h3 className="font-bold text-heading text-base border-b border-border pb-2.5">Personal Details</h3>
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-base">📞</span>
                  <span className="text-body font-medium">{profile.phone}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3">
                  <span className="text-base">📍</span>
                  <span className="text-body font-medium">{profile.location}</span>
                </div>
              )}
              {profile?.languages && (
                <div className="flex items-center gap-3">
                  <span className="text-base">🌍</span>
                  <span className="text-body font-medium">{profile.languages}</span>
                </div>
              )}
              {profile?.bio && (
                <p className="text-body/80 pt-2 italic text-xs leading-relaxed border-t border-border/50">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}
            </div>
          )}

          <ProfileCompletenessCard
            completenessPercent={completenessPercent}
            role="agent"
            className="w-full"
          />


        </div>

        {/* Right Column: Account Settings Section */}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-heading">Account settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            <ThemePreferenceCard />
            {SETTINGS_SECTIONS.map((section) => {
              const isVerification = section.title === "Identity verification";
              return (
                <Link prefetch={false}
                  key={section.href}
                  href={section.href}
                  className={`group rounded-3xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                    isVerification
                      ? "bg-amber-50/30 border-amber-200 hover:border-amber-400"
                      : "border-border bg-card hover:border-heading/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                    isVerification
                      ? "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                      : "bg-mint text-primary group-hover:bg-primary group-hover:text-white"
                  }`}>
                    {section.icon}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="text-base font-bold text-heading group-hover:text-primary transition-colors">{section.title}</h3>
                    <p className="text-sm text-body/70 leading-relaxed">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-body/50 group-hover:text-primary transition-colors mt-auto">
                    Manage
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
