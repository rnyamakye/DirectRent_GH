"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface KycActionsProps {
  requestId: string;
  documentUrl: string;
  status: string;
}

export function KycActions({ requestId, documentUrl, status }: KycActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approved" | "rejected" | null>(null);
  const [viewingDoc, setViewingDoc] = useState(false);
  const supabase = createClient();

  const handleUpdate = async (newStatus: "approved" | "rejected") => {
    setLoadingAction(newStatus);
    try {
      const res = await fetch(`/api/admin/kyc/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          notes: newStatus === "rejected" ? "Document did not meet verification criteria." : null 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Request ${newStatus} successfully.`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewDocument = async () => {
    setViewingDoc(true);
    try {
      // It's a private bucket, so we need to create a signed URL to view it
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .createSignedUrl(documentUrl, 60 * 5); // 5 minutes

      if (error || !data) {
        throw new Error("Failed to generate signed URL");
      }

      // Open in new tab
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      toast.error("Failed to load document.");
    } finally {
      setViewingDoc(false);
    }
  };

  if (status !== "pending") {
    return (
      <span className="text-xs text-body italic opacity-50">
        Action taken
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleViewDocument}
        disabled={viewingDoc || loadingAction !== null}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-slate-50 transition text-heading flex items-center gap-1"
      >
        {viewingDoc ? <Spinner className="w-3 h-3" /> : null}
        View ID
      </button>

      <button
        onClick={() => handleUpdate("approved")}
        disabled={loadingAction !== null || status !== "pending"}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2"
      >
        {loadingAction === "approved" ? <Spinner className="w-3 h-3" /> : null}
        Approve
      </button>

      <button
        onClick={() => handleUpdate("rejected")}
        disabled={loadingAction !== null || status !== "pending"}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 flex items-center gap-2"
      >
        {loadingAction === "rejected" ? <Spinner className="w-3 h-3" /> : null}
        Reject
      </button>
    </div>
  );
}
