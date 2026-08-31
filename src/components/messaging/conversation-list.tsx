"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { twMerge } from "tailwind-merge";

interface Conversation {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  last_message_at: string;
  other_participant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  last_message?: {
    content: string | null;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface ConversationListProps {
  currentUserId: string;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({ currentUserId, activeConversationId, onSelectConversation }: ConversationListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    // Fetch conversations where current user is a participant
    const { data: convs, error } = await supabase
      .from("conversations")
      .select(`
        id,
        participant_one_id,
        participant_two_id,
        last_message_at
      `)
      .or(`participant_one_id.eq.${currentUserId},participant_two_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error || !convs) {
      console.error("Error fetching conversations:", error);
      setIsLoading(false);
      return;
    }

    // Now we need the profile of the *other* participant
    // For a complex query we might use a view, but doing it in a few queries is fine for now
    const enhancedConvs: Conversation[] = [];

    for (const c of convs) {
      const otherId = c.participant_one_id === currentUserId ? c.participant_two_id : c.participant_one_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", otherId)
        .single();

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", currentUserId)
        .is("read_at", null);

      enhancedConvs.push({
        ...c,
        other_participant: profile || { id: otherId, full_name: "Unknown User", avatar_url: null, role: "user" },
        last_message: lastMsg || undefined,
        unread_count: unreadCount || 0
      });
    }

    // Re-sort just in case
    enhancedConvs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    setConversations(enhancedConvs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages to re-fetch/update the list
    const channel = supabase
      .channel(`messages-list-watch-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          // If a message was marked as read, refresh to update unread_count
          if (payload.new && (payload.new as any).read_at !== (payload.old as any).read_at) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-5 border-b border-border bg-white flex items-center sticky top-0 z-10 gap-3">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-body transition-colors md:hidden flex items-center justify-center"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-heading">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-body/70 text-sm">
            No conversations yet.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const hasUnread = (conv.unread_count || 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={twMerge(
                    "w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-slate-100/80",
                    isActive ? "bg-white relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary" : "bg-transparent"
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-lg">
                      {conv.other_participant.avatar_url ? (
                        <img src={conv.other_participant.avatar_url} alt={conv.other_participant.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{conv.other_participant.full_name.charAt(0)}</span>
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute top-0 right-0 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 border-2 border-white rounded-full text-[9px] font-bold text-white shadow-sm">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-1">
                      <p className={twMerge("text-sm truncate", isActive ? "text-primary font-bold" : hasUnread ? "font-bold text-heading" : "font-semibold text-heading")}>
                        {conv.other_participant.full_name}
                      </p>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-body/60 whitespace-nowrap">
                          {new Date(conv.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <p className={twMerge("text-xs truncate flex-1", hasUnread && !isActive ? "text-heading font-medium" : "text-body/70")}>
                        {(() => {
                          if (!conv.last_message?.content) return "Started a conversation";
                          let text = conv.last_message.content;
                          if (text.includes('__LISTING_CONTEXT_START__') && text.includes('__LISTING_CONTEXT_END__')) {
                            const endIdx = text.indexOf('__LISTING_CONTEXT_END__') + '__LISTING_CONTEXT_END__'.length;
                            text = text.substring(endIdx).trim();
                          }
                          return text || "Replying to listing";
                        })()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
