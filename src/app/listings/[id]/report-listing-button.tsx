"use client";

import { useState } from "react";
import { ReportSubmissionModal } from "@/components/ui/report-submission-modal";

interface ReportListingButtonProps {
  listingId: string;
  listingTitle: string;
}

export function ReportListingButton({ listingId, listingTitle }: ReportListingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full text-center text-xs font-semibold text-body/50 hover:text-red-500 transition mt-4 flex items-center justify-center gap-1.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3zM12 8v4M12 16h.01" />
        </svg>
        Report this listing
      </button>

      <ReportSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="listing"
        targetId={listingId}
        targetName={listingTitle}
      />
    </>
  );
}
