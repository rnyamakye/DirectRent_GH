import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewsSection } from "@/components/reviews-section";
import { BackButton } from "@/components/back-button";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agent, error } = await supabase
    .from("profiles")
    .select("full_name, business_name, created_at")
    .eq("id", id)
    .eq("role", "agent")
    .single();

  if (error || !agent) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listingsData } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", id)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  const listings = listingsData ?? [];

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_id, profiles!reviews_reviewer_id_fkey(full_name)")
    .eq("target_type", "agent")
    .eq("target_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer_id: r.reviewer_id,
    reviewerName: r.profiles?.full_name ?? "Anonymous",
  }));

  const displayName = agent.business_name ?? agent.full_name ?? "Agent";
  const averageRating =
    reviews.length === 0
      ? null
      : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;
  const memberSince = new Date(agent.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col gap-10">
      <BackButton />

      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-mint flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">{displayName}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-body">
            {averageRating !== null && (
              <span className="flex items-center gap-1 font-semibold text-heading">
                ★ {averageRating.toFixed(1)}
                <span className="font-normal text-body">
                  ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                </span>
              </span>
            )}
            <span>Agent since {memberSince}</span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Listings */}
      <div>
        <h2 className="text-xl font-semibold text-heading mb-5">
          {listings.length} active listing{listings.length === 1 ? "" : "s"}
        </h2>

        {listings.length === 0 ? (
          <p className="font-supporting text-sm text-body">
            No active listings right now — check back later.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] bg-mint overflow-hidden">
                  {listing.photo_urls && listing.photo_urls.length > 0 ? (
                    <img
                      src={listing.photo_urls[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-supporting text-body">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-heading truncate">{listing.title}</p>
                  <p className="text-sm text-body mt-0.5">{listing.landmark}</p>
                  <p className="font-semibold text-primary mt-2">
                    GHS {listing.price.toLocaleString()}
                    <span className="font-normal text-body text-sm"> / mo</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-heading mb-4">Reviews</h2>
        <ReviewsSection
          targetType="agent"
          targetId={agent.id}
          initialReviews={reviews}
          currentUserId={user?.id ?? null}
          currentUserRole={user?.user_metadata?.role ?? null}
        />
      </div>

      <div>
        <Link href="/auth/login" className="text-sm font-supporting text-body underline">
          Report this agent
        </Link>
      </div>
    </main>
  );
}