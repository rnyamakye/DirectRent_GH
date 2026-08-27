"use client";

import { useState } from "react";
import { ReportSubmissionModal } from "@/components/ui/report-submission-modal";

interface ReportUserButtonProps {
  userId: string;
  userName: string;
}

export function ReportUserButton({ userId, userName }: ReportUserButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full text-center text-xs font-semibold text-body/50 hover:text-red-500 transition mt-4 flex items-center justify-center gap-1.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Report {userName}
      </button>

      <ReportSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="profile"
        targetId={userId}
        targetName={userName}
      />
    </>
  );
}
