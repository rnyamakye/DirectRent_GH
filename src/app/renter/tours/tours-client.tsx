"use client";

import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ReviewSubmissionModal } from "@/components/ui/review-submission-modal";
import { ContactModal } from "@/components/ui/contact-modal";

type Tour = {
  id: string;
  agent_id: string;
  listing_id: string;
  tour_date: string;
  tour_time: string;
  tour_type: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  listings: {
    title: string;
    landmark: string;
  };
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
};

export function RenterToursClient({ initialTours }: { initialTours: any[] }) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "cancelled">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tourToCancel, setTourToCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string; type: "listing" | "agent" } | null>(null);
  const [contactTarget, setContactTarget] = useState<Tour | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const filteredTours = tours.filter((t) => t.status === activeTab);

  const handleMessageAgent = async (agentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: conv } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${agentId}),and(participant_one_id.eq.${agentId},participant_two_id.eq.${user.id})`)
          .single();

      if (!conv) {
          const { data: newConv, error: createError } = await supabase
              .from("conversations")
              .insert({ participant_one_id: user.id, participant_two_id: agentId })
              .select("id")
              .single();
          
          if (createError) throw createError;
          conv = newConv;
      }
      
      if (conv) {
          router.push(`/renter/messages?conversationId=${conv.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to open messages");
    }
  };

  const handleCancelTour = async () => {
    if (!tourToCancel) return;
    
    setProcessingId(tourToCancel);
    try {
      const res = await fetch(`/api/tours/${tourToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel tour");
      }

      setTours((current) =>
        current.map((t) => (t.id === tourToCancel ? { ...t, status: "cancelled" } : t))
      );
      toast.success("Tour cancelled successfully.");
      setTourToCancel(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "cancelled", label: "Cancelled" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={twMerge(
              "pb-3 text-sm font-semibold transition-colors border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-body/60 hover:text-heading"
            )}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-slate-100 text-body px-2 py-0.5 rounded-full">
              {tours.filter((t) => t.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {filteredTours.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-heading">No {activeTab} tours</h3>
          <p className="text-body/70 mt-1 max-w-sm">
            You don't have any {activeTab} tour requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTours.map((tour) => {
            const dateObj = new Date(`${tour.tour_date}T${tour.tour_time}`);
            const agentName = tour.profiles?.full_name || "Unknown Agent";

            return (
              <div key={tour.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-6">
                
                {/* Agent & Listing Info */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-border flex-shrink-0 flex items-center justify-center font-bold text-slate-400">
                      {agentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-heading text-sm">{agentName}</p>
                      <p className="text-xs text-body/70">Property Agent</p>
                    </div>
                  </div>

                  <Link href={`/listings/${tour.listing_id}`} target="_blank" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center text-[20px]">
                      🏠
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-heading truncate group-hover:text-primary transition">{tour.listings?.title || "Unknown Listing"}</p>
                      <p className="text-xs text-body/70 truncate">{tour.listings?.landmark || "No landmark specified"}</p>
                    </div>
                  </Link>
                </div>

                {/* Tour Details & Actions */}
                <div className="flex flex-col md:items-end justify-between gap-4 border-t border-border/50 pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                  <div className="flex flex-col md:items-end gap-1">
                    <div className="flex items-center gap-2 text-heading font-bold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {format(dateObj, "EEEE, MMMM do, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-body font-medium">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {format(dateObj, "h:mm a")}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-slate-100 text-body">
                      {tour.tour_type === "physical" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      )}
                      {tour.tour_type} Tour
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-auto">
                    {(activeTab === "pending" || activeTab === "confirmed") && (
                      <button
                        onClick={() => setTourToCancel(tour.id)}
                        disabled={processingId === tour.id}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-red-600 transition disabled:opacity-50"
                      >
                        Cancel Tour
                      </button>
                    )}
                    
                    {activeTab === "confirmed" && (
                      <button
                        onClick={() => setContactTarget(tour)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Contact Agent
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!tourToCancel}
        title="Cancel Tour Request"
        message="Are you sure you want to cancel this tour? The agent will be notified."
        confirmText="Cancel Tour"
        isDestructive={true}
        isLoading={!!processingId}
        onConfirm={handleCancelTour}
        onClose={() => setTourToCancel(null)}
      />

      <ReviewSubmissionModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        targetType={reviewTarget?.type ?? "listing"}
        targetId={reviewTarget?.id ?? ""}
        targetName={reviewTarget?.name ?? ""}
      />

      <ContactModal
        isOpen={!!contactTarget}
        onClose={() => setContactTarget(null)}
        title="Contact Agent"
        name={contactTarget?.profiles?.full_name || "Agent"}
        phone={contactTarget?.profiles?.phone || null}
        email={contactTarget?.profiles?.email || null}
        role="agent"
        onMessage={() => contactTarget && handleMessageAgent(contactTarget.agent_id)}
      />
    </div>
  );
}
