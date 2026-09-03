"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { ContactModal } from "@/components/ui/contact-modal";

type TourRequest = {
  id: string;
  tour_date: string;
  tour_time: string;
  tour_type: "physical" | "virtual";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  renter: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  listing: {
    id: string;
    title: string;
    photo_urls: string[] | null;
    landmark: string;
  };
};

export default function ToursClient({ initialTours, currentUserId }: { initialTours: any[]; currentUserId: string }) {
  const supabase = createClient();
  const [tours, setTours] = useState<TourRequest[]>(initialTours);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "cancelled" | "completed">("pending");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [contactTarget, setContactTarget] = useState<TourRequest | null>(null);

  const router = useRouter();

  // Read tourId from URL to set active tab and scroll to it
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tourId = params.get("tourId");
      if (tourId) {
        const targetTour = tours.find((t) => t.id === tourId);
        if (targetTour) {
          setActiveTab(targetTour.status);
          setTimeout(() => {
            const el = document.getElementById(`tour-${tourId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              // Add temporary highlight
              el.classList.add("ring-2", "ring-primary", "ring-offset-4");
              setTimeout(() => {
                el.classList.remove("ring-2", "ring-primary", "ring-offset-4");
                // Remove param from URL
                window.history.replaceState({}, '', '/agent/tours');
              }, 2000);
            }
          }, 100);
        }
      }
    }
  }, [tours]);

  const filteredTours = tours.filter((t) => t.status === activeTab);

  const handleMessageRenter = async (renterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${renterId}),and(participant_one_id.eq.${renterId},participant_two_id.eq.${user.id})`)
        .single();

      if (!conv) {
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({ participant_one_id: user.id, participant_two_id: renterId })
          .select("id")
          .single();

        if (createError) throw createError;
        conv = newConv;
      }

      if (conv) {
        router.push(`/agent/messages?conversationId=${conv.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to open messages");
    }
  };

  const handleUpdateStatus = async (tourId: string, newStatus: "confirmed" | "cancelled" | "completed") => {
    setIsUpdating(tourId);

    const { error } = await supabase
      .from("tour_requests")
      .update({ status: newStatus })
      .eq("id", tourId);

    if (error) {
      console.error(error);
      toast.error(`Failed to ${newStatus === "confirmed" ? "accept" : "decline"} tour.`);
    } else {
      const actionText = newStatus === "confirmed" ? "accepted" : newStatus === "completed" ? "completed" : "declined";
      toast.success(`Tour ${actionText} successfully.`);
      setTours((prev) =>
        prev.map((t) => (t.id === tourId ? { ...t, status: newStatus } : t))
      );
    }

    setIsUpdating(null);
  };

  const tabs = [
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">Requested Tours</h1>
        <p className="text-sm mt-1">Manage tour requests from prospective renters.</p>
      </div>

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
            return (
              <div id={`tour-${tour.id}`} key={tour.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-6 transition-all duration-500">

                {/* Renter & Listing Info */}
                <div className="flex-1 flex flex-col gap-4">
                  <Link href={`/renters/${tour.renter.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-border flex-shrink-0 group-hover:border-primary/50 transition-colors">
                      {tour.renter.avatar_url ? (
                        <img src={tour.renter.avatar_url} alt={tour.renter.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 group-hover:text-primary transition-colors">
                          {tour.renter.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-heading text-sm group-hover:text-primary transition-colors">{tour.renter.full_name}</p>
                      <p className="text-xs text-body/70">Requested a tour</p>
                    </div>
                  </Link>

                  <Link href={`/listings/${tour.listing.id}`} target="_blank" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                      {tour.listing.photo_urls && tour.listing.photo_urls[0] ? (
                        <img src={tour.listing.photo_urls[0]} alt="Listing" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-body/40">No photo</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-heading truncate group-hover:text-primary transition">{tour.listing.title}</p>
                      <p className="text-xs text-body/70 truncate">{tour.listing.landmark || "No landmark specified"}</p>
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

                  {activeTab === "pending" && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        disabled={isUpdating === tour.id}
                        onClick={() => handleUpdateStatus(tour.id, "cancelled")}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-heading transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        disabled={isUpdating === tour.id}
                        onClick={() => handleUpdateStatus(tour.id, "confirmed")}
                        className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-white shadow-sm transition disabled:opacity-50"
                      >
                        {isUpdating === tour.id ? <Spinner className="w-4 h-4" /> : "Accept"}
                      </button>
                    </div>
                  )}

                  {activeTab === "confirmed" && (
                    <div className="flex gap-2 w-full md:w-auto mt-auto">
                      <button
                        disabled={isUpdating === tour.id}
                        onClick={() => handleUpdateStatus(tour.id, "completed")}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl font-semibold text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 transition disabled:opacity-50"
                      >
                        {isUpdating === tour.id ? <Spinner className="w-4 h-4" /> : "Complete Tour"}
                      </button>
                      <button
                        onClick={() => setContactTarget(tour)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Contact Renter
                      </button>
                    </div>
                  )}

                  {activeTab === "completed" && (
                    <button
                      onClick={() => setContactTarget(tour)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Contact Renter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ContactModal
        isOpen={!!contactTarget}
        onClose={() => setContactTarget(null)}
        title="Contact Renter"
        name={contactTarget?.renter.full_name || "Renter"}
        phone={contactTarget?.renter.phone || null}
        email={null}
        role="renter"
        onMessage={() => contactTarget && handleMessageRenter(contactTarget.renter.id)}
      />
    </div>
  );
}
