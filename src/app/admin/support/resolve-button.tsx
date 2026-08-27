"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { resolveSupportTicket } from "./actions";

export default function ResolveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async () => {
    setLoading(true);
    try {
      const res = await resolveSupportTicket(id);
      if (res.error) throw new Error(res.error);
      
      toast.success("Ticket marked as resolved");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleResolve}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
    >
      {loading ? "Resolving..." : "Mark as Resolved"}
    </button>
  );
}
