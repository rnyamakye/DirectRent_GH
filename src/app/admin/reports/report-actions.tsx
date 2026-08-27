"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface ReportActionsProps {
  reportId: string;
  targetType: "listing" | "profile";
  targetId: string;
  status: string;
}

export function ReportActions({ reportId, targetType, targetId, status }: ReportActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Confirmation Modals State
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const handleDismiss = async () => {
    setLoadingAction("dismiss");
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to dismiss report");
      toast.success("Report dismissed.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
      setShowDismissModal(false);
    }
  };

  const handleSuspend = async () => {
    setLoadingAction("suspend");
    try {
      // 1. Suspend the entity
      const modRes = await fetch(`/api/admin/moderate/${targetType}/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      });
      if (!modRes.ok) throw new Error(`Failed to suspend ${targetType}`);

      // 2. Mark report as resolved
      const repRes = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!repRes.ok) throw new Error("Suspended, but failed to update report status");

      toast.success(`${targetType === "listing" ? "Listing" : "User"} suspended successfully.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
      setShowSuspendModal(false);
    }
  };

  if (status !== "pending") {
    return <span className="text-xs font-semibold text-body/50 uppercase tracking-widest">Resolved</span>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSuspendModal(true)}
          disabled={loadingAction !== null}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition whitespace-nowrap"
        >
          Suspend {targetType === 'listing' ? 'Listing' : 'User'}
        </button>
        <button
          onClick={() => setShowDismissModal(true)}
          disabled={loadingAction !== null}
          className="px-3 py-1.5 border border-border hover:bg-slate-50 text-heading rounded-lg text-xs font-bold transition"
        >
          Dismiss
        </button>
      </div>

      <ConfirmationModal
        isOpen={showDismissModal}
        onClose={() => setShowDismissModal(false)}
        onConfirm={handleDismiss}
        title="Dismiss Report"
        message="Are you sure you want to dismiss this report? No action will be taken against the target."
        confirmText="Dismiss Report"
        isLoading={loadingAction === "dismiss"}
      />

      <ConfirmationModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title={`Suspend ${targetType === 'listing' ? 'Listing' : 'User'}`}
        message={`Are you sure you want to suspend this ${targetType}? They will no longer be visible to the public.`}
        confirmText="Yes, Suspend"
        isDestructive={true}
        isLoading={loadingAction === "suspend"}
      />
    </>
  );
}
