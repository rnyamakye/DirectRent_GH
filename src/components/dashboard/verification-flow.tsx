"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

interface VerificationFlowProps {
  isVerified: boolean;
  kycStatus: "pending" | "approved" | "rejected" | null;
  kycNotes: string | null;
}

export function VerificationFlow({ isVerified, kycStatus, kycNotes }: VerificationFlowProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  if (isVerified || kycStatus === "approved") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl shadow-sm">
          ✓
        </div>
        <div>
          <h2 className="font-bold text-emerald-900 text-2xl">Identity Verified</h2>
          <p className="text-emerald-700 mt-2 max-w-md mx-auto">
            Your account is fully verified. You now have the "Verified" badge on your profile, which increases trust with potential clients.
          </p>
        </div>
      </div>
    );
  }

  if (kycStatus === "pending") {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm gap-4">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-4xl shadow-sm">
          ⏳
        </div>
        <div>
          <h2 className="font-bold text-amber-900 text-2xl">Verification Pending</h2>
          <p className="text-amber-700 mt-2 max-w-md mx-auto">
            We are currently reviewing your submitted documents. This usually takes 1-2 business days. We will notify you once it's complete.
          </p>
        </div>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to private bucket
      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file);

      if (uploadError) {
        throw new Error("Failed to upload document");
      }

      const documentUrl = fileName;

      // Submit request
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_url: documentUrl })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit request");
      }

      toast.success("Verification request submitted!");
      // Reload page to reflect new status
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-3xl shadow-sm flex-shrink-0">
          🛡️
        </div>
        <div className="flex-1 w-full min-w-0">
          <h2 className="font-bold text-heading text-xl sm:text-2xl">Submit Verification Documents</h2>
          <p className="text-body/80 mt-2 leading-relaxed">
            Upload a valid government-issued ID (Passport, National ID, or Driver's License) or a Business Registration certificate to get the "Verified" badge. This badge is displayed on your profile and listings to build trust with renters.
          </p>
          
          {kycStatus === "rejected" && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 flex flex-col gap-1">
              <span className="font-bold text-red-900">Your previous submission was rejected:</span> 
              <span className="text-sm">{kycNotes || "The document provided was unclear, expired, or invalid."}</span>
              <span className="text-sm font-semibold mt-1">Please upload a clearer or valid document.</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 border border-border/50 p-4 sm:p-6 rounded-2xl w-full">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer transition"
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center justify-center min-w-[140px] w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {uploading && <Spinner className="w-4 h-4 mr-2" />}
              {uploading ? "Submitting..." : "Submit Document"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
