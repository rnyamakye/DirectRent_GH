"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { ReportUserButton } from "@/components/report-user-button";
import { ReportListingButton } from "@/app/listings/[id]/report-listing-button";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "listing" | "agent" | "artisan";
  targetId: string;
  targetName: string;
  /** Called after a successful review submission with the saved review data */
  onSuccess?: (review: { id: string; rating: number; comment: string | null }) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          toast.error(data.error || "Not allowed to review");
          onClose();
          return;
        }
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      onSuccess?.(data.review);
      onClose();
      setComment("");
      setRating(5);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayRating = hoveredRating || rating;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-canvas rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-heading">Leave a Review</h3>
            <p className="text-sm text-body/70 mt-0.5">for <span className="font-semibold text-body">{targetName}</span></p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-body/50 hover:text-heading transition p-1 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-semibold text-heading mb-2 block">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <span className={star <= displayRating ? "text-amber-400" : "text-slate-200"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-body/60 mt-1.5">
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="review-comment" className="text-sm font-semibold text-heading mb-2 block">
              Your Comments <span className="font-normal text-body/50">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience to help others..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-border bg-card text-heading hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-6 py-2.5 text-sm font-bold transition disabled:opacity-50"
            >
              {loading && <Spinner className="w-4 h-4" />}
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-border">
          {targetType === "listing" ? (
            <ReportListingButton listingId={targetId} listingTitle={targetName} />
          ) : (
            <ReportUserButton userId={targetId} userName={targetName} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
