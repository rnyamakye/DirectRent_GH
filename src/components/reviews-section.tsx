"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    reviewer_id: string | null;
    reviewerName: string;
};

export function ReviewsSection({
    targetType,
    targetId,
    initialReviews,
    currentUserId,
    currentUserRole,
}: {
    targetType: "listing" | "artisan" | "agent";
    targetId: string;
    initialReviews: Review[];
    currentUserId: string | null;
    currentUserRole?: string | null;
}) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialReviews);
    const existingOwnReview = reviews.find((r) => r.reviewer_id === currentUserId);

    const [rating, setRating] = useState(existingOwnReview?.rating ?? 5);
    const [comment, setComment] = useState(existingOwnReview?.comment ?? "");
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const average =
        reviews.length === 0
            ? null
            : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const supabase = createClient();

        // upsert + onConflict: inserts a new review, OR updates this same
        // person's existing review on this same target — whichever
        // applies. The unique constraint from the migration is what tells
        // Postgres which existing row counts as "the same one."
        const { data, error: upsertError } = await supabase
            .from("reviews")
            .upsert(
                { reviewer_id: currentUserId, target_type: targetType, target_id: targetId, rating, comment },
                { onConflict: "reviewer_id,target_type,target_id" }
            )
            .select("id, rating, comment, reviewer_id")
            .single();

        setSubmitting(false);

        if (upsertError || !data) {
            setError(upsertError?.message ?? "Could not save review.");
            return;
        }

        // Replace this user's review in the local list if editing, or add
        // it if this was their first review here — avoids a full refetch.
        setReviews((current) => [
            { ...data, reviewerName: "You" },
            ...current.filter((r) => r.reviewer_id !== currentUserId),
        ]);
        setShowForm(false);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-heading">Reviews</h2>
                {average !== null && (
                    <p className="font-supporting text-sm text-body">
                        {"★".repeat(Math.round(average))} {average.toFixed(1)} ({reviews.length})
                    </p>
                )}
            </div>

            {reviews.length === 0 ? (
                <p className="font-supporting text-sm text-body mb-3">No reviews yet.</p>
            ) : (
                <div className="flex flex-col gap-3 mb-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-border bg-card p-3">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-heading text-sm">{review.reviewerName}</p>
                                <p className="text-primary text-sm">{"★".repeat(review.rating)}</p>
                            </div>
                            {review.comment && (
                                <p className="font-supporting text-sm text-body mt-1">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!currentUserId ? (
                <button
                    onClick={() =>
                        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
                    }
                    className="text-sm font-semibold text-primary"
                >
                    Log in to leave a review →
                </button>
            ) : currentUserRole === "agent" || currentUserRole === "artisan" ? null : showForm ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                aria-label={`${star} star`}
                                className={`text-lg leading-none ${star <= rating ? "text-primary" : "text-border"}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={3}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-supporting"
                    />
                    {error && <p className="text-xs font-supporting text-accent">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : existingOwnReview ? "Update review" : "Submit review"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="border border-border rounded-lg px-4 py-2 text-xs font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setShowForm(true)} className="text-sm font-semibold text-primary">
                    {existingOwnReview ? "Edit your review →" : "Leave a review →"}
                </button>
            )}
        </div>
    );
}