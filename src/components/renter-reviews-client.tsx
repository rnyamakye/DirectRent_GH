"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    targetType: "listing" | "artisan" | "agent";
    targetId: string;
    targetName: string;
};

export function RenterReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftComment, setDraftComment] = useState("");
    const [draftRating, setDraftRating] = useState(5);

    function startEditing(review: Review) {
        setEditingId(review.id);
        setDraftComment(review.comment ?? "");
        setDraftRating(review.rating);
    }

    async function saveEdit(id: string) {
        const supabase = createClient();
        await supabase
            .from("reviews")
            .update({ rating: draftRating, comment: draftComment })
            .eq("id", id);

        setReviews((current) =>
            current.map((r) => (r.id === id ? { ...r, rating: draftRating, comment: draftComment } : r))
        );
        setEditingId(null);
    }

    async function handleDelete(id: string) {
        setReviews((current) => current.filter((r) => r.id !== id)); // optimistic
        const supabase = createClient();
        await supabase.from("reviews").delete().eq("id", id);
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-heading">My reviews</h1>
                <p className="text-base text-body/80">Manage the reviews you've written.</p>
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
                    <p className="text-lg font-semibold text-heading">You haven't left any reviews yet.</p>
                    <p className="text-body/70 max-w-sm text-sm">
                        Share your experiences to help the DirectRent community.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                            <Link
                                href={
                                    review.targetType === "listing"
                                        ? `/listings/${review.targetId}`
                                        : review.targetType === "artisan"
                                        ? `/artisans/${review.targetId}`
                                        : `/agents/${review.targetId}`
                                }
                                className="font-bold text-lg text-heading hover:text-primary transition-colors inline-block w-fit"
                            >
                                {review.targetName}
                            </Link>

                            {editingId === review.id ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setDraftRating(star)}
                                                className={`text-2xl leading-none transition-transform hover:scale-110 ${star <= draftRating ? "text-primary" : "text-border"}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={draftComment}
                                        onChange={(e) => setDraftComment(e.target.value)}
                                        className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        rows={4}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => saveEdit(review.id)}
                                            className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-sm hover:shadow-primary/20"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="border border-border bg-card hover:bg-slate-50 text-heading rounded-xl px-5 py-2.5 text-sm font-semibold transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className={`text-lg leading-none ${star <= review.rating ? "text-primary" : "text-border"}`}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-body leading-relaxed text-sm">{review.comment}</p>
                                    )}
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={() => startEditing(review)} className="text-sm font-semibold text-primary hover:text-primary-hover underline decoration-primary/30 hover:decoration-primary transition-colors">
                                            Edit review
                                        </button>
                                        <button onClick={() => handleDelete(review.id)} className="text-sm font-semibold text-accent hover:text-red-700 underline decoration-accent/30 hover:decoration-accent transition-colors">
                                            Delete review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}