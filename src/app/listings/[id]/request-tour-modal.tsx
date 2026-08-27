"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function RequestTourModal({
  listingId,
  agentId,
  isOpen,
  onClose,
}: {
  listingId: string;
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [tourType, setTourType] = useState<"physical" | "virtual">("physical");
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          agent_id: agentId,
          tour_date: tourDate,
          tour_time: tourTime,
          tour_type: tourType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request tour");
      }

      toast.success("Tour request sent! The agent will be notified.");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for the min date attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-heading transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-heading mb-2">Request a Tour</h2>
        <p className="text-body text-sm mb-6">Select a date and time to view the property.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-heading">Tour Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTourType("physical")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                  tourType === "physical"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-heading hover:bg-slate-50"
                }`}
              >
                Physical Tour
              </button>
              <button
                type="button"
                onClick={() => setTourType("virtual")}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                  tourType === "virtual"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-heading hover:bg-slate-50"
                }`}
              >
                Virtual Tour
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tourDate" className="text-sm font-semibold text-heading">Date</label>
            <input
              type="date"
              id="tourDate"
              required
              min={minDate}
              value={tourDate}
              onChange={(e) => setTourDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tourTime" className="text-sm font-semibold text-heading">Time</label>
            <input
              type="time"
              id="tourTime"
              required
              value={tourTime}
              onChange={(e) => setTourTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tourDate || !tourTime}
            className="mt-2 w-full bg-primary hover:bg-primary-hover text-white rounded-xl px-6 py-3.5 text-sm font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Send Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
