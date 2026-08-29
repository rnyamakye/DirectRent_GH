"use client";

import { useState } from "react";

export function ContactAgentButton({
    agentId,
    phone,
    email
}: {
    agentId: string;
    phone: string | null;
    email?: string | null;
}) {
    const [messaging, setMessaging] = useState(false);

    return (
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
                        window.location.href = `/${role}/messages?conversationId=${conv.id}`;
                    }
                } else {
                    // Not logged in, redirect to login
                    window.location.href = `/auth/login?returnTo=/messages`;
                }
                setMessaging(false);
            }}
            disabled={messaging}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3 font-bold hover:bg-primary-hover transition mt-6 disabled:opacity-50"
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
    );
}
