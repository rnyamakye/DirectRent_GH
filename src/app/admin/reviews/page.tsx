import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import ReviewActions from "./review-actions";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      renter_profiles:renter_id ( full_name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load reviews: {error.message}</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Content Moderation: Reviews</h1>
        <p className="text-body font-supporting">Review and remove inappropriate feedback on the platform.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-canvas border-b border-border text-sm font-semibold text-body">
              <th className="p-4">Author</th>
              <th className="p-4">Rating</th>
              <th className="p-4 w-1/3">Comment</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews?.map((review) => (
              <tr key={review.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <div className="font-bold text-heading text-sm">{review.renter_profiles?.full_name || "Unknown Renter"}</div>
                  <div className="text-xs text-body mt-1">Target ID: {review.target_id.slice(0,8)}...</div>
                </td>
                <td className="p-4">
                  <div className="flex text-orange-400 text-lg tracking-widest">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-body line-clamp-3">{review.comment || <span className="italic text-body/50">No comment</span>}</p>
                </td>
                <td className="p-4 text-sm text-body">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </td>
                <td className="p-4">
                  <ReviewActions id={review.id} />
                </td>
              </tr>
            ))}
            {reviews?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-body">No reviews found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
