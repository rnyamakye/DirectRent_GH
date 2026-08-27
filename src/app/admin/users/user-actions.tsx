"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { toggleUserSuspension, toggleUserVerification } from "./actions";

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
  const router = useRouter();

  const handleToggleSuspension = async () => {
    if (!window.confirm(`Are you sure you want to ${isSuspended ? 'un-suspend' : 'suspend'} this user?`)) return;
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
    }
  };

  const handleToggleVerification = async () => {
    if (!window.confirm(`Are you sure you want to ${isVerified ? 'remove verification from' : 'verify'} this user?`)) return;
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
    }
  };

  return (
    <div className="flex gap-2">
      {role === "artisan" && (
        <button 
          onClick={handleToggleVerification} 
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50 ${isVerified ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
        >
          {isVerified ? "Revoke Verification" : "Verify Artisan"}
        </button>
      )}
      <button 
        onClick={handleToggleSuspension} 
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50 ${isSuspended ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
      >
        {isSuspended ? "Un-Suspend" : "Suspend"}
      </button>
    </div>
  );
}
