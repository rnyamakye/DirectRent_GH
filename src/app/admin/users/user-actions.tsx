"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { toggleUserSuspension, toggleUserVerification } from "./actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function UserActions({ 
  id, 
  isSuspended, 
  isVerified, 
  role 
}: { 
  id: string, 
  isSuspended: boolean, 
  isVerified: boolean,
  role: string 
}) {
  const [loading, setLoading] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  
  const router = useRouter();

  const handleToggleSuspension = async () => {
    setLoading(true);
    try {
      const res = await toggleUserSuspension(id, isSuspended);
      if (res.error) throw new Error(res.error);
      toast.success(`User ${isSuspended ? 'un-suspended' : 'suspended'}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setLoading(false);
      setIsSuspensionModalOpen(false);
    }
  };

  const handleToggleVerification = async () => {
    setLoading(true);
    try {
      const res = await toggleUserVerification(id, isVerified);
      if (res.error) throw new Error(res.error);
      toast.success(`User ${isVerified ? 'un-verified' : 'verified'}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setLoading(false);
      setIsVerificationModalOpen(false);
    }
  };

  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex gap-2">
      {(role === "artisan" || role === "agent") && (
        <>
          <button 
            onClick={() => setIsVerificationModalOpen(true)} 
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${isVerified ? 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50 hover:border-orange-300' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'}`}
          >
            {isVerified ? "Revoke Verification" : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Verify {roleTitle}
              </>
            )}
          </button>
          
          <ConfirmationModal 
            isOpen={isVerificationModalOpen}
            title={isVerified ? `Revoke Verification` : `Verify ${roleTitle}`}
            message={`Are you sure you want to ${isVerified ? 'remove verification from' : 'verify'} this ${role}?`}
            confirmText={isVerified ? "Revoke" : "Verify"}
            isDestructive={isVerified}
            isLoading={loading}
            onConfirm={handleToggleVerification}
            onClose={() => setIsVerificationModalOpen(false)}
          />
        </>
      )}

      <>
        <button 
          onClick={() => setIsSuspensionModalOpen(true)} 
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isSuspended ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300' : 'bg-white text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300'}`}
        >
          {isSuspended ? "Un-Suspend" : "Suspend"}
        </button>

        <ConfirmationModal 
          isOpen={isSuspensionModalOpen}
          title={isSuspended ? "Un-Suspend User" : "Suspend User"}
          message={`Are you sure you want to ${isSuspended ? 'un-suspend' : 'suspend'} this user?`}
          confirmText={isSuspended ? "Un-Suspend" : "Suspend"}
          isDestructive={!isSuspended}
          isLoading={loading}
          onConfirm={handleToggleSuspension}
          onClose={() => setIsSuspensionModalOpen(false)}
        />
      </>
    </div>
  );
}
