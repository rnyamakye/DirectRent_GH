"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

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

  const handleStatusUpdate = async (id: string, newStatus: "confirmed" | "cancelled") => {

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
      toast.success(`Booking ${newStatus === "confirmed" ? "accepted" : "declined"} successfully.`);
      if (newStatus === "cancelled") setBookingToDecline(null);
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
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">Pending</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide">Confirmed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wide">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wide">{status}</span>;
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
    <div className="overflow-x-auto border border-border rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Client</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Date & Time</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Location</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((booking) => {
            const profiles = booking.profiles as any;
            const renterName = profiles?.full_name || "Unknown Renter";
            const phone = profiles?.phone || "No phone";

            return (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <p className="font-semibold text-heading">{renterName}</p>
                  <p className="text-xs text-body/70 mt-0.5">{phone}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-heading">{formatDate(booking.booking_date)}</p>
                  <p className="text-xs text-body/70 mt-0.5">{booking.booking_time}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-body">{booking.location}</p>
                </td>
                <td className="p-4">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="p-4 text-right">
                  {booking.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                        disabled={processingId === booking.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setBookingToDecline(booking.id)}
                        disabled={processingId === booking.id}
                        className="px-3 py-1.5 bg-white border border-border hover:bg-slate-50 text-red-600 text-xs font-bold rounded-lg transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
