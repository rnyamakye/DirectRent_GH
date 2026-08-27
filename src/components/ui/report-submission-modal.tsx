"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "listing" | "profile";
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
}

export function ReportSubmissionModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}: ReportSubmissionModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      toast.success("Report submitted successfully. Our team will review it.");
      onSuccess?.();
      onClose();
      setReason("");
      setDetails("");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-canvas rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-red-600">Report {targetType === 'listing' ? 'Listing' : 'User'}</h3>
            <p className="text-sm text-body/70 mt-0.5">
              You are reporting <span className="font-semibold text-body">{targetName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-body/50 hover:text-heading transition p-1 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Reason */}
          <div>
            <label htmlFor="report-reason" className="text-sm font-semibold text-heading mb-2 block">
              Reason for reporting <span className="text-red-500">*</span>
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              <option value="" disabled>Select a reason...</option>
              {targetType === 'listing' ? (
                <>
                  <option value="scam">Scam / Fraudulent Listing</option>
                  <option value="unavailable">Property is no longer available</option>
                  <option value="inaccurate">Inaccurate information or photos</option>
                  <option value="spam">Spam</option>
                </>
              ) : (
                <>
                  <option value="scam">Scammer / Fraudulent Behavior</option>
                  <option value="harassment">Harassment or abusive behavior</option>
                  <option value="inappropriate">Inappropriate profile content</option>
                  <option value="spam">Spam</option>
                </>
              )}
              <option value="other">Other</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="report-details" className="text-sm font-semibold text-heading mb-2 block">
              Additional Details <span className="font-normal text-body/50">(optional)</span>
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional context..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-border bg-card text-heading hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition disabled:opacity-50"
            >
              {loading && <Spinner className="w-4 h-4" />}
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
