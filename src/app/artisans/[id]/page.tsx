import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/back-button";
import { BookArtisanButton, type Booking } from "@/components/book-artisan-button";
import { ReviewsSection } from "@/components/reviews-section";

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?returnTo=/artisans/${id}`);
  }

  const { data: artisan, error } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(full_name, created_at, avatar_url, is_verified, phone)")
    .eq("id", id)
    .single();

  if (error || !artisan) {
    notFound();
  }

  if (user?.id !== id) {
    // Record profile view
    await supabase.from("profile_views").insert({
      target_id: id,
      viewer_id: user?.id ?? null,
    });
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, created_at, profiles!reviews_reviewer_id_fkey(full_name)")
    .eq("target_type", "artisan")
    .eq("target_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer_id: r.reviewer_id,
    created_at: r.created_at,
    reviewerName: (r.profiles as any)?.full_name ?? "Anonymous",
  }));

  const artisanName = id === user?.id ? "You" : (artisan.profiles?.full_name ?? "Artisan");
  const initials = artisanName.charAt(0).toUpperCase();
  const avatarUrl = artisan.profiles?.avatar_url ?? null;


  const createdDate = artisan.profiles?.created_at
    ? new Date(artisan.profiles.created_at)
    : new Date();
  const now = new Date();
  const monthsActive =
    (now.getFullYear() - createdDate.getFullYear()) * 12 +
    (now.getMonth() - createdDate.getMonth());

  const photos: string[] = artisan.photo_urls ?? [];

  // Fetch existing active booking for this user+artisan
  const { data: existingBookingData } = await supabase
    .from("bookings")
    .select("*")
    .eq("artisan_id", id)
    .eq("renter_id", user.id)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  const existingBooking: Booking | null = existingBookingData ?? null;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[80vh]">
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start mt-6">

        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 top-28">
          <div className=" rounded-3xl p-8  border border-border/50 flex flex-col items-center text-center">
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-mint flex items-center justify-center text-4xl text-primary font-bold">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={artisanName} fill sizes="128px" className="object-cover rounded-full" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              {artisan.availability === "available" && (
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full border-2 border-white" title="Available Now">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-heading mt-5">{artisanName}</h1>
            <div className="flex items-center gap-1 font-bold text-sm text-heading mt-1 mb-4">
              <span className="uppercase tracking-widest text-primary">{artisan.trade}</span>
            </div>

            <BookArtisanButton
              artisanId={id}
              artisanName={artisanName}
              artisanPhone={artisan.profiles?.phone}
              existingBooking={existingBooking}
            />

            <div className="flex w-full divide-x divide-border border-t border-border pt-6 mt-2">
              <div className="flex-1 flex flex-col items-center">
                <span className="font-extrabold text-heading text-lg">{reviews.length}</span>
                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Reviews</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="font-extrabold text-heading text-lg">{Math.max(1, monthsActive)}</span>
                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-12 pt-6">

          {/* About Section */}
          <div>
            <h2 className="text-3xl font-bold text-heading mb-6">About {artisanName}</h2>
            <div className="flex flex-col gap-4 text-heading">
              {artisan.trade && (
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none stroke-current" style={{ strokeWidth: 2 }}><path d="M28 20c0 4.4-5.4 8-12 8S4 24.4 4 20c0-2.9 2.1-5.5 5.4-7.1L8 10h16l-1.4 2.9C25.9 14.5 28 17.1 28 20zM8 10V6a2 2 0 014 0v4M20 10V6a2 2 0 014 0v4" /></svg>
                  <span>Works as <strong>{artisan.trade}</strong></span>
                </div>
              )}
              {artisan.service_area && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>Serves <strong>{artisan.service_area}</strong></span>
                </div>
              )}
              {artisan.profiles?.is_verified && (
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none stroke-current text-emerald-600" style={{ strokeWidth: 2 }}><path d="M16 2a14 14 0 100 28 14 14 0 000-28zm9.9 8.5L13.5 23l-5.4-5.4" /></svg>
                  <span><strong>Identity verified</strong></span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${artisan.availability === "available" ? "text-emerald-600" : "text-body/50"}`}>
                  {artisan.availability === "available" ? "✓ Available now" : "Currently busy"}
                </span>
              </div>
            </div>
            <p className="text-body mt-6 leading-relaxed max-w-2xl whitespace-pre-wrap">
              {artisan.bio || `Hi, I am ${artisanName}. I take pride in delivering quality craftsmanship to every job. Get in touch and let's discuss your needs.`}
            </p>
          </div>

          <hr className="border-border" />

          {/* Services Offered */}
          {artisan.services && artisan.services.length > 0 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-heading mb-5">Services offered</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.services.map((service: string) => (
                    <span
                      key={service}
                      className="rounded-full bg-mint text-primary text-sm font-semibold px-4 py-1.5"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Work Photos */}
          {photos.length > 0 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-heading mb-5">Work photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.slice(0, 6).map((url, i) => (
                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden bg-mint">
                      <Image src={url} alt="" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Safety Warning */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-4 text-sm text-orange-900 flex gap-3 items-start">
            <span className="text-lg">⚠️</span>
            <p>
              <strong>Safety Warning:</strong> Do not pay any deposit or service fee until you have met
              the artisan in person and verified what is being offered.
            </p>
          </div>

          <hr className="border-border" />

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-heading mb-8">
                  What clients are saying about {artisanName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-heading text-lg">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-heading">{review.reviewerName}</span>
                          <span className="text-sm text-body">
                            {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-[10px] text-heading">
                          {"★".repeat(review.rating)}
                        </div>
                        <span className="text-body text-xs">•</span>
                        <span className="text-xs text-body">DirectRent</span>
                      </div>
                      <p className="text-heading text-base leading-relaxed line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
                {reviews.length > 4 && (
                  <button className="mt-8 px-6 py-3 border border-heading rounded-lg font-semibold text-heading hover:bg-slate-50 transition">
                    Show all {reviews.length} reviews
                  </button>
                )}
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Leave a Review */}
          <div>
            <h2 className="text-xl font-semibold text-heading mb-4">Leave a review</h2>
            <ReviewsSection
              targetType="artisan"
              targetId={artisan.id}
              initialReviews={reviews}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.user_metadata?.role ?? null}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
