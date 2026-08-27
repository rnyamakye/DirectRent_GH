"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewSubmissionModal } from "@/components/ui/review-submission-modal";

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
    targetName,
    initialReviews,
    currentUserId,
    currentUserRole,
}: {
    targetType: "listing" | "artisan" | "agent";
    targetId: string;
    /** Human-readable name of the target (listing title, agent name etc.) */
    targetName?: string;
    initialReviews: Review[];
    currentUserId: string | null;
    currentUserRole?: string | null;
}) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialReviews);
    const [showModal, setShowModal] = useState(false);

    const existingOwnReview = reviews.find((r) => r.reviewer_id === currentUserId);

    const average =
        reviews.length === 0
            ? null
            : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;

    const handleReviewSuccess = (review: { id: string; rating: number; comment: string | null }) => {
        setReviews((current) => [
            { ...review, reviewerName: "You", reviewer_id: currentUserId ?? "" },
            ...current.filter((r) => r.reviewer_id !== currentUserId),
        ]);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-heading">Reviews</h2>
                {average !== null && targetType !== "artisan" && (
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
                                <p className="text-amber-400 text-sm">{"★".repeat(review.rating)}<span className="text-slate-200">{"★".repeat(5 - review.rating)}</span></p>
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
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-xs font-semibold"
                >
                    Log in to leave a review
                </button>
            ) : currentUserRole === "agent" || currentUserRole === "artisan" ? null : (
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-xs font-semibold"
                >
                    {existingOwnReview ? "Edit your review" : "Leave a review"}
                </button>
            )}

            <ReviewSubmissionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                targetType={targetType}
                targetId={targetId}
                targetName={targetName ?? targetType}
                onSuccess={handleReviewSuccess}
            />
        </div>
    );
}