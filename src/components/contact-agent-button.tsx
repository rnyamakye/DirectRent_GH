"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactAgentButton({
    agentId,
    email,
    phone,
    listingId,
    listingTitle,
    existingTour
}: {
    agentId: string;
    email?: string | null;
    phone?: string | null;
    listingId?: string | number;
    listingTitle?: string;
    existingTour?: { id: string; status: string } | null;
}) {
    const [messaging, setMessaging] = useState(false);
    const router = useRouter();

    if (!existingTour) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 mt-6">
            <button
                onClick={async () => {
                    setMessaging(true);
                    const { createClient } = await import("@/lib/supabase/client");
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    if (user) {
                        let { data: conv } = await supabase
                            .from("conversations")
                            .select("id")
                            .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${agentId}),and(participant_one_id.eq.${agentId},participant_two_id.eq.${user.id})`)
                            .single();

                        if (!conv) {
                            const { data: newConv } = await supabase
                                .from("conversations")
                                .insert({ participant_one_id: user.id, participant_two_id: agentId })
                                .select("id")
                                .single();
                            conv = newConv;
                        }
                        
                        if (conv) {
                            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
                            const role = profile?.role || "renter";
                            let url = `/${role}/messages?conversationId=${conv.id}`;
                            if (listingId && listingTitle) {
                                url += `&listingId=${listingId}&listingTitle=${encodeURIComponent(listingTitle)}`;
                            }
                            router.push(url);
                        }
                    } else {
                        router.push(`/auth/login?returnTo=/messages`);
                    }
                    setMessaging(false);
                }}
                disabled={messaging}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3 font-bold hover:bg-primary-hover transition disabled:opacity-50"
            >
                {messaging ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
                Message Agent
            </button>

            {existingTour.status === "confirmed" && phone && (
                <a
                    href={`tel:${phone}`}
                    className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-lg py-3 font-bold hover:bg-slate-50 transition"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5.5z" />
                    </svg>
                    Call Agent
                </a>
            )}
        </div>
    );
}
