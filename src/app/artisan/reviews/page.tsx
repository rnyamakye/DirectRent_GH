import { createClient } from "@/lib/supabase/server";

export default async function ArtisanReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, profiles(full_name)")
    .eq("target_type", "artisan")
    .eq("target_id", user.id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer: (r.profiles as any)?.full_name ?? "Anonymous",
  }));

  const average =
    reviews.length === 0 ? 0 : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;

  const starLevels = [5, 4, 3, 2, 1];
  const breakdown = starLevels.map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-md w-full px-4 sm:px-6 py-12">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">My reviews</h1>
        <p className="font-supporting text-sm text-body">
          {reviews.length === 0 ? "No reviews yet" : `${average.toFixed(1)} average · ${reviews.length} reviews`}
        </p>
      </div>
      </div>
      {reviews.length > 0 && (
        <div className="flex flex-col gap-1">
          {breakdown.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2 text-xs font-supporting text-body">
              <span className="w-8">{stars}★</span>
              <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(count / reviews.length) * 100}%` }}
                />
              </div>
              <span className="w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-heading text-sm">{review.reviewer}</p>
              <p className="text-primary text-sm">{"★".repeat(review.rating)}</p>
            </div>
            {review.comment && (
              <p className="font-supporting text-sm text-body mt-1">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
