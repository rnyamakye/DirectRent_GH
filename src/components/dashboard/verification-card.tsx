"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

interface VerificationCardProps {
  isVerified: boolean;
  kycStatus: "pending" | "approved" | "rejected" | null;
  kycNotes: string | null;
}

export function VerificationCard({ isVerified, kycStatus, kycNotes }: VerificationCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  if (isVerified || kycStatus === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
            ✓
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-lg">Identity Verified</h3>
            <p className="text-sm text-emerald-700 mt-1">Your account is fully verified. You get a badge on your profile!</p>
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">
            ⏳
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-lg">Verification Pending</h3>
            <p className="text-sm text-amber-700 mt-1">We are reviewing your submitted documents. This usually takes 1-2 business days.</p>
          </div>
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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-2xl">
          🛡️
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-heading text-lg">Verify Your Identity</h3>
          <p className="text-sm text-body/80 mt-1">
            Upload a government-issued ID (Passport, National ID, or Driver's License) to get the "Verified" badge and build trust with renters.
          </p>
          
          {kycStatus === "rejected" && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <span className="font-bold">Your previous submission was rejected:</span> {kycNotes || "Document was unclear or invalid."}
              <br />Please upload a clearer document.
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center justify-center min-w-[120px] bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2 text-sm font-bold transition disabled:opacity-50"
            >
              {uploading && <Spinner className="w-4 h-4 mr-2" />}
              {uploading ? "Submitting..." : "Submit ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
