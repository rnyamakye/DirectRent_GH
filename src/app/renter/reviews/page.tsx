import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RenterReviewsClient } from "@/components/renter-reviews-client";

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewer_id", user.id)
    .order("created_at", { ascending: false });

  const listingIds = (reviews ?? [])
    .filter((r) => r.target_type === "listing")
    .map((r) => r.target_id);
  const artisanIds = (reviews ?? [])
    .filter((r) => r.target_type === "artisan")
    .map((r) => r.target_id);
  const agentIds = (reviews ?? [])
    .filter((r) => r.target_type === "agent")
    .map((r) => r.target_id);

  // Only query each table if there's actually a matching id to look
  // for — .in("id", []) with an empty array is wasted work.
  const { data: listings } =
    listingIds.length > 0
      ? await supabase.from("listings").select("id, title").in("id", listingIds)
      : { data: [] };

  const { data: artisans } =
    artisanIds.length > 0
      ? await supabase
        .from("artisan_profiles")
        .select("id, profiles(full_name)")
        .in("id", artisanIds)
      : { data: [] };

  const { data: agents } =
    agentIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", agentIds)
      : { data: [] };

  // Stitch everything into one flat shape the client component can
  // render without knowing anything about listings vs. artisans.
  const enrichedReviews = (reviews ?? []).map((review) => {
    let targetName = "No longer available";
    if (review.target_type === "listing") {
      const target = listings?.find((l) => l.id === review.target_id);
      targetName = target?.title ?? targetName;
    } else if (review.target_type === "artisan") {
      const target = artisans?.find((a) => a.id === review.target_id);
      targetName = (target as { profiles?: { full_name?: string } } | undefined)?.profiles?.full_name ?? targetName;
    } else {
      const target = agents?.find((a) => a.id === review.target_id);
      targetName = (target as { full_name?: string } | undefined)?.full_name ?? targetName;
    }

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      targetType: review.target_type as "listing" | "artisan" | "agent",
      targetId: review.target_id,
      targetName,
    };
  });

  return <RenterReviewsClient initialReviews={enrichedReviews} />;
}
