"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = {
  id: string;
  renter_id: string;
  booking_date: string;
  booking_time: string;
  location: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
  };
};

export function ArtisanBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bookingToDecline, setBookingToDecline] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const router = useRouter();

  const handleMessageRenter = async (renterId: string) => {
    setMessagingId(renterId);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        let { data: conv } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${renterId}),and(participant_one_id.eq.${renterId},participant_two_id.eq.${user.id})`)
          .single();

        if (!conv) {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({ participant_one_id: user.id, participant_two_id: renterId })
            .select("id")
            .single();
          conv = newConv;
        }

        if (conv) {
          window.location.href = `/artisan/messages?conversationId=${conv.id}`;
        }
      }
    } catch (err: any) {
      toast.error("Could not start conversation");
    } finally {
      setMessagingId(null);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "confirmed" | "cancelled" | "completed") => {

    setProcessingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update booking");
      }

      setBookings((current) =>
        current.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      toast.success(`Booking ${newStatus === "confirmed" ? "accepted" : newStatus === "completed" ? "completed" : "declined"} successfully.`);
      if (newStatus === "cancelled") setBookingToDecline(null);

      router.refresh(); // Invalidate Next.js client router cache so this persists
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
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">Pending</span>;
      case "confirmed":
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">Confirmed</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide">Declined</span>;
      case "completed":
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">Completed</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="p-12 border border-border rounded-2xl text-center bg-slate-50 flex flex-col items-center justify-center">
        <span className="text-4xl mb-4">📅</span>
        <h3 className="text-lg font-bold text-heading mb-10">No bookings yet</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const profiles = booking.profiles as any;
        const renterName = profiles?.full_name || "Unknown Renter";

        return (
          <div key={booking.id} className="bg-white border border-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 justify-between shadow-sm hover:shadow-md transition">
            <div className="flex flex-col gap-4">
              {/* Renter Info */}
              <Link href={`/renters/${booking.renter_id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg border border-border/50 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                  {renterName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-heading text-base group-hover:text-primary transition-colors">{renterName}</p>
                </div>
              </Link>

              {/* Booking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex items-start gap-2.5 text-sm text-body">
                  <span className="mt-0.5 text-lg">📅</span>
                  <div>
                    <p className="font-semibold text-heading">{formatDate(booking.booking_date)}</p>
                    <p className="text-body/70">{booking.booking_time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-body">
                  <span className="mt-0.5 text-lg">📍</span>
                  <p className="leading-relaxed">{booking.location}</p>
                </div>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="flex items-center justify-between w-full sm:w-auto sm:hidden">
                {getStatusBadge(booking.status)}
              </div>
              <div className="hidden sm:block">
                {getStatusBadge(booking.status)}
              </div>

              {booking.status === "pending" && (
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                    disabled={processingId === booking.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => setBookingToDecline(booking.id)}
                    disabled={processingId === booking.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-border hover:bg-red-50 hover:border-red-200 text-red-600 text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Decline
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="flex w-full sm:w-auto mt-auto gap-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, "completed")}
                    disabled={processingId === booking.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleMessageRenter(booking.renter_id)}
                    disabled={messagingId === booking.renter_id}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {messagingId === booking.renter_id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      ""
                    )}
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmationModal
        isOpen={!!bookingToDecline}
        title="Decline Booking"
        message="Are you sure you want to decline this booking request? The renter will be notified."
        confirmText="Decline Booking"
        isDestructive={true}
        isLoading={processingId === bookingToDecline}
        onConfirm={() => bookingToDecline && handleStatusUpdate(bookingToDecline, "cancelled")}
        onClose={() => setBookingToDecline(null)}
      />
    </div>
  );
}
