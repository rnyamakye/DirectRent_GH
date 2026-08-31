"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  photo_url: string | null;
  created_at: string;
  read_at?: string | null;
}

interface ChatWindowProps {
  currentUserId: string;
  conversationId: string;
  onBack: () => void;
}

export function ChatWindow({ currentUserId, conversationId, onBack }: ChatWindowProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contextListing, setContextListing] = useState<{ id: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<{ full_name: string; avatar_url: string | null; role: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let channel: any;

    const loadData = async () => {
      setIsLoading(true);

      // 1. Fetch conversation details to get the other participant
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_one_id, participant_two_id")
        .eq("id", conversationId)
        .single();

      if (conv) {
        const otherId = conv.participant_one_id === currentUserId ? conv.participant_two_id : conv.participant_one_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", otherId)
          .single();

        if (profile) setOtherParticipant(profile);
      }

      // 2. Fetch messages
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgs && !error) {
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);

        // 2.5 Mark unread messages as read
        const hasUnread = msgs.some(m => m.sender_id !== currentUserId && !m.read_at);
        if (hasUnread) {
          supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("conversation_id", conversationId)
            .neq("sender_id", currentUserId)
            .is("read_at", null)
            .then();
        }
      }

      setIsLoading(false);

      // 3. Subscribe to new messages for this conversation
      channel = supabase
        .channel(`chat-${conversationId}-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);

            // Mark new incoming messages as read since we are viewing the chat
            if (newMsg.sender_id !== currentUserId && !newMsg.read_at) {
              supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id)
                .then();
            }
          }
        )
        .subscribe();
    };

    loadData();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const listingId = params.get("listingId");
      const listingTitle = params.get("listingTitle");
      if (listingId && listingTitle) {
        setContextListing({ id: listingId, title: listingTitle });

        // Remove the parameter from URL so it doesn't stay there
        const newUrl = window.location.pathname + "?conversationId=" + conversationId;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    let finalContent = content;
    if (contextListing) {
      finalContent = `__LISTING_CONTEXT_START__${contextListing.id}::${contextListing.title}__LISTING_CONTEXT_END__\n` + content;
      setContextListing(null);
    }

    const tempId = "temp-" + Date.now();
    const optimisticMsg = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: finalContent,
      photo_url: null,
      created_at: new Date().toISOString(),
      read_at: null
    };

    setMessages((prev) => [...prev, optimisticMsg as any]);
    setTimeout(scrollToBottom, 100);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: finalContent
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + (error.message || JSON.stringify(error)));
      // Revert if failed
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
    } else if (data) {
      // Update with the real ID from DB
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 text-body transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
              {otherParticipant?.avatar_url ? (
                <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{otherParticipant?.full_name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-heading leading-tight">{otherParticipant?.full_name || "Loading..."}</h2>
              {otherParticipant?.role && (
                <p className="text-[11px] text-primary uppercase tracking-widest font-bold leading-tight">
                  {otherParticipant.role}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-4xl mb-4 opacity-50">👋</div>
            <p className="text-body font-medium">Say hello to {otherParticipant?.full_name}!</p>
            <p className="text-sm text-body/70 mt-1">Messages are end-to-end secured.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;

            // Basic grouping logic for UI cleanliness
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isConsecutive = prevMsg && prevMsg.sender_id === msg.sender_id;

            let actualContent = msg.content || "";
            let parsedListingId = null;
            let parsedListingTitle = null;

            if (actualContent) {
              const match = actualContent.match(/^__LISTING_CONTEXT_START__(.*?)::(.*?)__LISTING_CONTEXT_END__\n([\s\S]*)$/);
              if (match) {
                parsedListingId = match[1];
                parsedListingTitle = match[2];
                actualContent = match[3];
              }
            }

            return (
              <div
                key={msg.id}
                className={twMerge(
                  "flex flex-col max-w-[85%] sm:max-w-[75%]",
                  isMe ? "self-end items-end" : "self-start items-start",
                  isConsecutive ? "mt-1" : "mt-4"
                )}
              >
                <div
                  className={twMerge(
                    "px-4 py-2.5 rounded-2xl text-[15px] shadow-sm flex flex-col gap-1.5",
                    isMe
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-white border border-border text-heading rounded-tl-sm"
                  )}
                  style={{ wordBreak: 'break-word' }}
                >
                  {parsedListingTitle && (
                    <Link prefetch={false} href={`/listings/${parsedListingId}`} className={twMerge(
                      "block px-3 py-2 rounded-lg border-l-4 text-sm opacity-90 hover:opacity-100 transition-opacity",
                      isMe ? "bg-black/20 border-white/40 text-white" : "bg-slate-50 border-primary text-heading"
                    )}>
                      <div className="font-semibold text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Inquiry about</div>
                      <div className="font-bold truncate">{parsedListingTitle}</div>
                    </Link>
                  )}
                  <div className="whitespace-pre-wrap">{actualContent}</div>
                </div>
                {!isConsecutive && (
                  <span className="text-[10px] text-body/50 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-border flex flex-col gap-2">
        {contextListing && (
          <div className="bg-slate-50 border border-border rounded-lg px-4 py-3 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-body/70">Replying to Listing</p>
              <p className="font-semibold text-heading text-sm truncate">{contextListing.title}</p>
            </div>
            <button onClick={() => setContextListing(null)} className="text-body hover:text-heading p-1">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border border-border rounded-full px-5 py-3 text-sm text-heading placeholder:text-body/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
