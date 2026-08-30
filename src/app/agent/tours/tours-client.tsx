"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Tour = {
  id: string;
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

export function AgentToursClient({ initialTours }: { initialTours: any[] }) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: "confirmed" | "cancelled") => {
    if (newStatus === "cancelled" && !confirm("Are you sure you want to decline/cancel this tour?")) return;
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/tours/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update tour");
      }

      setTours((current) =>
        current.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Tour ${newStatus === "confirmed" ? "accepted" : "declined"} successfully.`);
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
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  if (tours.length === 0) {
    return (
      <div className="p-12 border border-border rounded-2xl text-center bg-slate-50 flex flex-col items-center justify-center">
        <span className="text-4xl mb-4">🏠</span>
        <h3 className="text-lg font-bold text-heading">No tour requests yet</h3>
        <p className="text-body mt-1">When renters request to view your properties, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-2xl bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-border">
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Renter</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Property</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Date & Time</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Type</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs font-semibold text-heading uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tours.map((tour) => {
            const renterName = tour.profiles?.full_name || "Unknown Renter";

            return (
              <tr key={tour.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <p className="font-semibold text-heading">{renterName}</p>
                </td>
                <td className="p-4 max-w-[200px]">
                  <p className="font-semibold text-heading truncate">{tour.listings?.title}</p>
                  <p className="text-xs text-body/70 mt-0.5 truncate">{tour.listings?.landmark}</p>
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
                  {tour.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(tour.id, "confirmed")}
                        disabled={processingId === tour.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(tour.id, "cancelled")}
                        disabled={processingId === tour.id}
                        className="px-3 py-1.5 bg-white border border-border hover:bg-slate-50 text-red-600 text-xs font-bold rounded-full transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {tour.status === "confirmed" && (
                    <button
                        onClick={() => handleStatusUpdate(tour.id, "cancelled")}
                        disabled={processingId === tour.id}
                        className="px-3 py-1.5 bg-white border border-border hover:bg-slate-50 text-red-600 text-xs font-bold rounded-full transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
