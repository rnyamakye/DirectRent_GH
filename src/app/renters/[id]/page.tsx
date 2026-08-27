import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .single();

  return {
    title: profile?.full_name ? `${profile.full_name} — DirectRent` : "Renter Profile — DirectRent",
    description: "View this renter's public profile on DirectRent.",
  };
}

export default async function PublicRenterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, location, occupation, languages, fun_fact, interests, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const initials = (profile.full_name || "U").charAt(0).toUpperCase();
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  const details = [
    { emoji: "💼", label: "Works as", value: profile.occupation },
    { emoji: "📍", label: "Lives in", value: profile.location },
    { emoji: "🌍", label: "Languages", value: profile.languages },
    { emoji: "⚡", label: "Fun fact", value: profile.fun_fact },
  ].filter((d) => d.value);

  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <BackButton />
        {/* Profile card */}
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 flex flex-col items-center text-center gap-5 shadow-sm">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-mint border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-4xl flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name ?? "User"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-heading">
              {profile.full_name ?? "DirectRent Renter"}
            </h1>
            {memberSince && (
              <p className="text-sm text-body/60 font-medium">Member since {memberSince}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-base text-body leading-relaxed max-w-md">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}
        </div>

        {/* Personal details */}
        {details.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="text-xl font-bold text-heading">About {profile.full_name?.split(" ")[0] ?? "this renter"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-border/50">
                  <span className="text-xl flex-shrink-0 mt-0.5">{detail.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-body/60 mb-0.5">{detail.label}</p>
                    <p className="text-sm font-semibold text-heading">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="text-xl font-bold text-heading">Interests</h2>
            <div className="flex flex-wrap gap-2.5">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-heading text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if profile is bare */}
        {!profile.bio && details.length === 0 && (!profile.interests || profile.interests.length === 0) && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center flex flex-col items-center gap-3">
            <p className="text-lg font-semibold text-heading">Profile not complete yet</p>
            <p className="text-sm text-body/70 max-w-xs">This renter hasn&apos;t filled in their profile details yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
