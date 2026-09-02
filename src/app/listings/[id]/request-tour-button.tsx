"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RequestTourModal } from "./request-tour-modal";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function RequestTourButton({
  listingId,
  agentId,
  existingTour,
}: {
  listingId: string;
  agentId: string;
  existingTour?: { id: string; status: string } | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancelTour = async () => {
    if (!existingTour) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/tours/${existingTour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel tour");
      }

      toast.success("Tour cancelled successfully.");
      setIsCancelModalOpen(false);
      router.refresh(); // Refresh page to remove existing tour state
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {existingTour ? (
        <button
          onClick={() => setIsCancelModalOpen(true)}
          disabled={loading}
          className="w-full mt-3 bg-card border border-red-500 text-red-500 hover:bg-red-50 rounded-full px-6 py-3.5 text-sm font-bold transition flex justify-center items-center gap-2 disabled:opacity-50"
        >
          Cancel Tour Request
        </button>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-3 bg-card border border-primary text-primary hover:bg-primary/5 rounded-full px-6 py-3.5 text-sm font-bold transition flex justify-center items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Request a Tour
        </button>
      )}

      <RequestTourModal
        listingId={listingId}
        agentId={agentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Tour Request"
        message="Are you sure you want to cancel your requested tour? The agent will be notified."
        confirmText="Cancel Tour"
        isDestructive={true}
        isLoading={loading}
        onConfirm={handleCancelTour}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </>
  );
}
