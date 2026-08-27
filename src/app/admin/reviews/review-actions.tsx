"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteReview } from "./actions";

export default function ReviewActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    setLoading(true);
    try {
      const res = await deleteReview(id);
      if (res.error) throw new Error(res.error);
      
      toast.success("Review deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete Review"}
    </button>
  );
}
