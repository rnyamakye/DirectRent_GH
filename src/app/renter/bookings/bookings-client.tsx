"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ReviewSubmissionModal } from "@/components/ui/review-submission-modal";

type Booking = {
  id: string;
  artisan_id: string;
  booking_date: string;
  booking_time: string;
  location: string;
  status: string;
  created_at: string;
  artisan_profiles: {
    trade: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
};

export function RenterBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const handleMessageArtisan = async (artisanId: string) => {
    setMessagingId(artisanId);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let { data: conv } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${artisanId}),and(participant_one_id.eq.${artisanId},participant_two_id.eq.${user.id})`)
          .single();

        if (!conv) {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({ participant_one_id: user.id, participant_two_id: artisanId })
            .select("id")
            .single();
          conv = newConv;
        }

        if (conv) {
          window.location.href = `/renter/messages?conversationId=${conv.id}`;
        }
      }
    } catch (err: any) {
      toast.error("Could not start conversation");
    } finally {
      setMessagingId(null);
    }
  };

  const handleCancel = async () => {
    if (!bookingToCancel) return;

    setProcessingId(bookingToCancel);
    try {
      const res = await fetch(`/api/bookings/${bookingToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel booking");
      }

      setBookings(current =>
        current.map(b => (b.id === bookingToCancel ? { ...b, status: "cancelled" } : b))
      );
      toast.success("Booking cancelled successfully.");
      setBookingToCancel(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">Pending</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">Confirmed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">Cancelled</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col">
      {bookings.map((booking, index) => {
        const artisanName = booking.artisan_profiles?.profiles?.full_name || "Unknown Artisan";
        const trade = booking.artisan_profiles?.trade || "Artisan";
        const avatarUrl = booking.artisan_profiles?.profiles?.avatar_url;
        const initials = artisanName.charAt(0).toUpperCase();
        
        return (
          <div 
            key={booking.id} 
            className={`p-6 flex flex-col md:flex-row gap-6 items-start md:items-center ${index !== bookings.length - 1 ? "border-b border-border" : ""}`}
          >
            {/* Artisan Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-mint flex items-center justify-center text-xl text-primary font-bold flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={artisanName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-heading text-lg">{artisanName}</h3>
                <p className="text-sm text-body/80">{trade}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="flex-1 flex flex-col gap-1 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">Date:</span>
                <span className="text-sm text-body">{new Date(booking.booking_date).toLocaleDateString("en-GB")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">Time:</span>
                <span className="text-sm text-body">{booking.booking_time.substring(0, 5)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-heading">Location:</span>
                <span className="text-sm text-body line-clamp-2">{booking.location}</span>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0 w-full md:w-32">
              {getStatusBadge(booking.status)}
              
              {booking.status === "pending" && (
                <button
                  onClick={() => setBookingToCancel(booking.id)}
                  disabled={processingId === booking.id}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 transition"
                >
                  {processingId === booking.id ? "Cancelling..." : "Cancel Request"}
                </button>
              )}
              {(booking.status === "confirmed" || booking.status === "completed") && (
                <div className="flex flex-col gap-3 w-full mt-2">
                  <button
                    onClick={() => handleMessageArtisan(booking.artisan_id)}
                    disabled={messagingId === booking.artisan_id}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {messagingId === booking.artisan_id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      "✉️"
                    )}
                    Message
                  </button>
                  <button
                    onClick={() => setReviewTarget({ id: booking.artisan_id, name: artisanName })}
                    className="text-sm text-primary hover:underline font-semibold transition text-center"
                  >
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      <ConfirmationModal
        isOpen={!!bookingToCancel}
        title="Cancel Booking Request"
        message="Are you sure you want to cancel this booking request? The artisan will be notified."
        confirmText="Cancel Booking"
        isDestructive={true}
        isLoading={!!processingId}
        onConfirm={handleCancel}
        onClose={() => setBookingToCancel(null)}
      />

      <ReviewSubmissionModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        targetType="artisan"
        targetId={reviewTarget?.id ?? ""}
        targetName={reviewTarget?.name ?? ""}
      />
    </div>
  );
}
