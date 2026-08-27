"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ReviewSubmissionModal } from "@/components/ui/review-submission-modal";

type Tour = {
  id: string;
  agent_id: string;
  listing_id: string;
  tour_date: string;
  tour_time: string;
  tour_type: string;
  status: string;
  created_at: string;
  listings: {
    title: string;
    landmark: string;
  };
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
};

export function RenterToursClient({ initialTours }: { initialTours: any[] }) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tourToCancel, setTourToCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string; type: "listing" | "agent" } | null>(null);

  const handleCancelTour = async () => {
    if (!tourToCancel) return;
    
    setProcessingId(tourToCancel);
    try {
      const res = await fetch(`/api/tours/${tourToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel tour");
      }

      setTours((current) =>
        current.map((t) => (t.id === tourToCancel ? { ...t, status: "cancelled" } : t))
      );
      toast.success("Tour cancelled successfully.");
      setTourToCancel(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">Pending</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">Confirmed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  if (tours.length === 0) {
    return (
      <div className="p-12 border border-border rounded-2xl text-center bg-slate-50 flex flex-col items-center justify-center">
        <span className="text-4xl mb-4">🏠</span>
        <h3 className="text-lg font-bold text-heading">No tour requests yet</h3>
        <p className="text-body mt-1">When you request to view a property, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-2xl bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Property</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Agent</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Date & Time</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Type</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tours.map((tour) => {
            const agentName = tour.profiles?.full_name || "Unknown Agent";
            const phone = tour.profiles?.phone || "No phone";

            return (
              <tr key={tour.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4 max-w-[200px]">
                  <p className="font-semibold text-heading truncate">{tour.listings?.title}</p>
                  <p className="text-xs text-body/70 mt-0.5 truncate">{tour.listings?.landmark}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-heading">{agentName}</p>
                  <p className="text-xs text-body/70 mt-0.5">{phone}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-heading">{formatDate(tour.tour_date)}</p>
                  <p className="text-xs text-body/70 mt-0.5">{tour.tour_time.substring(0, 5)}</p>
                </td>
                <td className="p-4">
                  <span className="capitalize text-sm text-body font-medium">{tour.tour_type}</span>
                </td>
                <td className="p-4">
                  {getStatusBadge(tour.status)}
                </td>
                <td className="p-4 text-right">
                  {(tour.status === "pending" || tour.status === "confirmed") && (
                    <button
                      onClick={() => setTourToCancel(tour.id)}
                      disabled={processingId === tour.id}
                      className="px-4 py-2 bg-white border border-border hover:bg-slate-50 text-red-600 text-xs font-bold rounded-full transition disabled:opacity-50 inline-block"
                    >
                      Cancel Tour
                    </button>
                  )}
                  {tour.status === "confirmed" && (
                    <button
                      onClick={() => setReviewTarget({ id: tour.listing_id, name: tour.listings?.title ?? "this listing", type: "listing" })}
                      className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold rounded-full transition inline-block"
                    >
                      Leave a Review
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmationModal
        isOpen={!!tourToCancel}
        title="Cancel Tour Request"
        message="Are you sure you want to cancel this tour? The agent will be notified."
        confirmText="Cancel Tour"
        isDestructive={true}
        isLoading={!!processingId}
        onConfirm={handleCancelTour}
        onClose={() => setTourToCancel(null)}
      />

      <ReviewSubmissionModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        targetType={reviewTarget?.type ?? "listing"}
        targetId={reviewTarget?.id ?? ""}
        targetName={reviewTarget?.name ?? ""}
      />
    </div>
  );
}
