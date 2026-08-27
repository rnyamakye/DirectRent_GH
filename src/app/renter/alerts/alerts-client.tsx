"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export interface Alert {
  id: string;
  city: string | null;
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  bedrooms: number | null;
  created_at: string;
}

export function AlertsClient({ initialAlerts }: { initialAlerts: Alert[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteAlertId, setDeleteAlertId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteAlertId) return;
    setLoadingId(deleteAlertId);

    try {
      const res = await fetch(`/api/alerts/${deleteAlertId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete alert");
      }

      toast.success("Alert deleted successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
      setDeleteAlertId(null);
    }
  };

  if (initialAlerts.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-12 border border-border text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="font-semibold text-lg text-heading">No saved searches</p>
        <p className="text-sm text-body mt-1 max-w-sm mx-auto">
          You haven't set up any search alerts yet. Go to the listings page, set your filters, and click "Save Search" to get notified when matching properties are posted.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialAlerts.map(alert => {
          const criteria = [];
          if (alert.city) criteria.push(`Area: ${alert.city}`);
          if (alert.property_type) criteria.push(`Type: ${alert.property_type}`);
          if (alert.bedrooms) criteria.push(`Beds: ${alert.bedrooms}+`);
          
          let priceStr = "";
          if (alert.min_price && alert.max_price) priceStr = `GHS ${alert.min_price} - ${alert.max_price}`;
          else if (alert.min_price) priceStr = `Min GHS ${alert.min_price}`;
          else if (alert.max_price) priceStr = `Max GHS ${alert.max_price}`;
          
          if (priceStr) criteria.push(priceStr);

          return (
            <div key={alert.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-bold text-heading">Search Alert</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {criteria.length > 0 ? criteria.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      {c}
                    </span>
                  )) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      Any Property
                    </span>
                  )}
                </div>
                
                <p className="text-[10px] text-body/50 font-bold uppercase tracking-wider">
                  Created {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mt-5 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setDeleteAlertId(alert.id)}
                  disabled={loadingId === alert.id}
                  className="text-sm font-semibold text-red-500 hover:text-red-700 transition flex items-center gap-2"
                >
                  {loadingId === alert.id ? <Spinner className="w-4 h-4" /> : "Delete Alert"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={!!deleteAlertId}
        onClose={() => setDeleteAlertId(null)}
        onConfirm={handleDelete}
        title="Delete Alert"
        message="Are you sure you want to delete this search alert? You will no longer receive notifications for matching properties."
        confirmText="Yes, delete it"
        isDestructive={true}
        isLoading={loadingId === deleteAlertId}
      />
    </>
  );
}
