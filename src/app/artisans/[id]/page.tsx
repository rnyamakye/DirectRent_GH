import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewsSection } from "@/components/reviews-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactArtisanButton } from "@/components/contact-artisan-button";

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: artisan, error } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(full_name, created_at, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !artisan) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id !== id) {
    // Record profile view
    await supabase.from("profile_views").insert({
      target_id: id,
      viewer_id: user?.id ?? null,
    });
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, profiles(full_name)")
    .eq("target_type", "artisan")
    .eq("target_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer_id: r.reviewer_id,
    reviewerName: r.profiles?.full_name ?? "Anonymous",
  }));

  const artisanName = id === user?.id ? "You" : (artisan.profiles?.full_name ?? "Artisan");
  const averageRating =
    reviews.length === 0
      ? null
      : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;
  const memberSince = artisan.profiles?.created_at
    ? new Date(artisan.profiles.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : null;
  const photos: string[] = artisan.photo_urls ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex flex-col gap-10">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Artisans", href: "/artisans" },
        { label: artisanName },
      ]} />

      {/* Header Profile Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-mint flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl flex-shrink-0">
            <img src={artisan.profiles?.avatar_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"} alt={artisanName} className="w-full h-full object-cover" />
          </div>
          <div className="sm:hidden flex flex-col">
            <h1 className="text-2xl font-bold text-heading leading-tight">{artisanName}</h1>
            <span className="text-sm font-semibold text-primary mt-1">{artisan.trade}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="hidden sm:block text-3xl font-bold text-heading">{artisanName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 sm:mt-2">
            <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {artisan.trade}
            </span>
            {averageRating !== null && (
              <span className="flex items-center gap-1 text-sm font-semibold text-heading">
                ★ {averageRating.toFixed(1)}
                <span className="font-normal text-body">({reviews.length})</span>
              </span>
            )}
            <span
              className={`text-sm font-semibold ${artisan.availability === "available" ? "text-emerald-600" : "text-body/50"
                }`}
            >
              {artisan.availability === "available" ? "Available now" : "Currently busy"}
            </span>
          </div>
          {artisan.service_area && (
            <p className="text-sm text-body mt-2 sm:mt-1">Serves: {artisan.service_area}</p>
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Photo grid, if any work photos exist */}
      {photos.length > 0 && (
        <>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 sm:grid sm:grid-cols-4 sm:pb-0 sm:overflow-visible sm:snap-none hide-scrollbar">
            {photos.slice(0, 4).map((url, i) => (
              <div key={i} className="flex-shrink-0 w-[60%] sm:w-full aspect-square rounded-2xl overflow-hidden bg-mint snap-center sm:snap-align-none">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <hr className="border-border" />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 pb-24 lg:pb-0">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          {artisan.bio && (
            <div>
              <h2 className="text-xl font-semibold text-heading mb-3">About</h2>
              <p className="font-supporting text-body leading-relaxed">{artisan.bio}</p>
              {memberSince && (
                <p className="text-sm text-body/60 mt-2">Member since {memberSince}</p>
              )}
            </div>
          )}

          {artisan.services && artisan.services.length > 0 && (
            <>
              <hr className="border-border" />
              <div>
                <h2 className="text-xl font-semibold text-heading mb-3">Services offered</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.services.map((service: string) => (
                    <span
                      key={service}
                      className="rounded-full bg-mint text-primary text-sm font-semibold px-3.5 py-1.5"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <hr className="border-border" />

          <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-4 text-sm text-orange-900 flex gap-3 items-start">
            <span className="text-lg">⚠️</span>
            <p>
              Do not pay any deposit or service fee until you have met in
              person and verified what is being offered.
            </p>
          </div>

          <hr className="border-border" />

          <div>
            <h2 className="text-xl font-semibold text-heading mb-4">Reviews</h2>
            <ReviewsSection
              targetType="artisan"
              targetId={artisan.id}
              initialReviews={reviews}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.user_metadata?.role ?? null}
            />
          </div>
        </div>

        {/* Right column — sticky contact card */}
        <div className="relative">
          {/* Desktop view */}
          <div className="hidden lg:flex sticky top-28 border border-border rounded-2xl p-6 shadow-xl bg-white flex-col gap-4">
            <p className="font-semibold text-heading">Contact {artisanName.split(" ")[0]}</p>
            {artisan.phone && (
              <p className="text-sm text-body">{artisan.phone}</p>
            )}
            <ContactArtisanButton artisanId={id} phone={artisan.phone} />
            <p className="text-center text-xs text-body/60">
              Always meet in person before making any payment.
            </p>
          </div>

          {/* Mobile view - Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-[40] bg-white border-t border-border p-4 px-4 sm:px-6 flex items-center justify-between shadow-[0_-8px_16px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col flex-1 mr-4">
              <p className="font-bold text-heading text-[15px] leading-tight truncate">Contact {artisanName.split(" ")[0]}</p>
              <p className={`text-[12px] font-semibold mt-0.5 ${artisan.availability === "available" ? "text-emerald-600" : "text-body/50"}`}>
                {artisan.availability === "available" ? "Available now" : "Currently busy"}
              </p>
            </div>
            <div className="w-[140px] sm:w-[160px] flex-shrink-0">
              <ContactArtisanButton artisanId={id} phone={artisan.phone} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}