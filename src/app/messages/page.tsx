"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; full_name: string; business_name: string | null; role: string };
type Conversation = { id: string; otherId: string; lastMessageAt: string };
type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    photo_url: string | null;
    created_at: string;
};

function MessagesPageContent() {
    const searchParams = useSearchParams();
    const withUserId = searchParams.get("with");
    const autoStartedRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const [myRole, setMyRole] = useState<string | null>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
    const [lastPreviewByConv, setLastPreviewByConv] = useState<Record<string, string>>({});
    const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});

    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const [composerText, setComposerText] = useState("");
    const [composerFile, setComposerFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [pickerQuery, setPickerQuery] = useState("");
    const [pickerResults, setPickerResults] = useState<Profile[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const loadEverything = useCallback(async () => {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: myProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        setMyId(user.id);
        setMyRole(myProfile?.role ?? null);

        const { data: convRows } = await supabase
            .from("conversations")
            .select("id, participant_one_id, participant_two_id, last_message_at")
            .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
            .order("last_message_at", { ascending: false });

        const convs: Conversation[] = (convRows ?? []).map((c) => ({
            id: c.id,
            otherId: c.participant_one_id === user.id ? c.participant_two_id : c.participant_one_id,
            lastMessageAt: c.last_message_at,
        }));
        setConversations(convs);

        const otherIds = convs.map((c) => c.otherId);
        if (otherIds.length > 0) {
            const { data: profileRows } = await supabase
                .from("profiles")
                .select("id, full_name, business_name, role")
                .in("id", otherIds);

            const map: Record<string, Profile> = {};
            (profileRows ?? []).forEach((p) => (map[p.id] = p));
            setProfilesById(map);
        }

        const convIds = convs.map((c) => c.id);
        if (convIds.length > 0) {
            const { data: recentMessages } = await supabase
                .from("messages")
                .select("*")
                .in("conversation_id", convIds)
                .order("created_at", { ascending: false })
                .limit(300);

            const previews: Record<string, string> = {};
            const unread: Record<string, number> = {};
            (recentMessages ?? []).forEach((m) => {
                if (!previews[m.conversation_id]) {
                    previews[m.conversation_id] = m.photo_url ? "📷 Photo" : m.content ?? "";
                }
                if (m.sender_id !== user.id && !m.read_at) {
                    unread[m.conversation_id] = (unread[m.conversation_id] ?? 0) + 1;
                }
            });
            setLastPreviewByConv(previews);
            setUnreadByConv(unread);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadEverything();
    }, [loadEverything]);

    useEffect(() => {
        if (!myId) return;
        const supabase = createClient();

        const channel = supabase
            .channel(`messages-realtime-${Date.now()}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    const newMessage = payload.new as Message;
                    const belongsToMe = conversations.some((c) => c.id === newMessage.conversation_id);
                    if (!belongsToMe) return;

                    if (newMessage.conversation_id === selectedConvId) {
                        setMessages((current) => [...current, newMessage]);
                    } else if (newMessage.sender_id !== myId) {
                        setUnreadByConv((current) => ({
                            ...current,
                            [newMessage.conversation_id]: (current[newMessage.conversation_id] ?? 0) + 1,
                        }));
                    }

                    setLastPreviewByConv((current) => ({
                        ...current,
                        [newMessage.conversation_id]: newMessage.photo_url
                            ? "📷 Photo"
                            : newMessage.content ?? "",
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
         
    }, [myId, selectedConvId, conversations]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages]);

    async function openConversation(convId: string) {
        setSelectedConvId(convId);
        setShowPicker(false);

        const supabase = createClient();
        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: true });

        setMessages(data ?? []);

        if (myId) {
            await supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("conversation_id", convId)
                .neq("sender_id", myId)
                .is("read_at", null);
            setUnreadByConv((current) => ({ ...current, [convId]: 0 }));
        }
    }

    const handleStartConversation = useCallback(
        async (otherUserId: string) => {
            if (!myId) return;
            const supabase = createClient();

            const [a, b] = [myId, otherUserId].sort();

            const { data: existing } = await supabase
                .from("conversations")
                .select("id")
                .eq("participant_one_id", a)
                .eq("participant_two_id", b)
                .maybeSingle();

            if (existing) {
                await loadEverything();
                openConversation(existing.id);
                return;
            }

            const { data: created, error } = await supabase
                .from("conversations")
                .insert({ participant_one_id: a, participant_two_id: b })
                .select("id")
                .single();

            if (error) {
                alert(error.message);
                return;
            }

            await loadEverything();
            openConversation(created.id);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [myId]
    );

    // Auto-select: when arriving via ?with=<userId> (from a listing's
    // "Message Agent" button, an artisan's contact card, etc.), start
    // or reuse that conversation as soon as we know who we are. The
    // ref guard stops this from re-firing on every render.
    useEffect(() => {
        if (!myId || !withUserId || autoStartedRef.current) return;
        if (withUserId === myId) return;
        autoStartedRef.current = true;
        handleStartConversation(withUserId);
    }, [myId, withUserId, handleStartConversation]);

    async function handleSearchRecipients(query: string) {
        setPickerQuery(query);
        if (!query.trim() || !myRole) {
            setPickerResults([]);
            return;
        }

        const supabase = createClient();
        const targetRoles = myRole === "renter" ? ["agent", "artisan"] : ["renter"];

        const { data } = await supabase
            .from("profiles")
            .select("id, full_name, business_name, role")
            .in("role", targetRoles)
            .ilike("full_name", `%${query}%`)
            .limit(10);

        setPickerResults(data ?? []);
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!myId || !selectedConvId || (!composerText.trim() && !composerFile)) return;

        setSending(true);
        const supabase = createClient();

        let photoUrl: string | null = null;
        if (composerFile) {
            const path = `${myId}/chat-${Date.now()}-${composerFile.name}`;
            const { error: uploadError } = await supabase.storage.from("photos").upload(path, composerFile);
            if (uploadError) {
                alert(uploadError.message);
                setSending(false);
                return;
            }
            const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
            photoUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from("messages").insert({
            conversation_id: selectedConvId,
            sender_id: myId,
            content: composerText.trim() || null,
            photo_url: photoUrl,
        });

        setSending(false);
        if (error) {
            alert(error.message);
            return;
        }

        setComposerText("");
        setComposerFile(null);
    }

    if (loading) {
        return <p className="font-supporting text-sm text-body p-6">Loading...</p>;
    }

    const selectedProfile = selectedConvId
        ? profilesById[conversations.find((c) => c.id === selectedConvId)?.otherId ?? ""]
        : null;

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-104px)] flex border border-border rounded-2xl overflow-hidden bg-card my-6">
            {/* Conversation list — hidden on mobile once a thread is open */}
            <div
                className={`${selectedConvId ? "hidden sm:flex" : "flex"
                    } w-full sm:w-80 border-r border-border flex-col flex-shrink-0`}
            >
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h1 className="font-bold text-heading">Messages</h1>
                    <button
                        onClick={() => setShowPicker((v) => !v)}
                        className="text-xs font-semibold text-primary hover:text-primary-hover"
                    >
                        + New
                    </button>
                </div>

                {showPicker && (
                    <div className="p-4 border-b border-border flex flex-col gap-2">
                        <input
                            type="text"
                            autoFocus
                            placeholder={myRole === "renter" ? "Search agents or artisans…" : "Search renters…"}
                            value={pickerQuery}
                            onChange={(e) => handleSearchRecipients(e.target.value)}
                            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                            {pickerResults.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleStartConversation(p.id)}
                                    className="text-left text-sm px-2 py-1.5 rounded-lg hover:bg-mint/40 transition"
                                >
                                    <span className="font-semibold text-heading">
                                        {p.business_name ?? p.full_name}
                                    </span>{" "}
                                    <span className="text-body/60 text-xs">({p.role})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="font-supporting text-sm text-body p-4">No conversations yet.</p>
                    ) : (
                        conversations.map((conv) => {
                            const other = profilesById[conv.otherId];
                            const unread = unreadByConv[conv.id] ?? 0;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => openConversation(conv.id)}
                                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-mint/20 transition flex items-center gap-3 ${selectedConvId === conv.id ? "bg-mint/30" : ""
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-primary font-bold flex-shrink-0">
                                        {(other?.business_name ?? other?.full_name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-heading text-sm truncate">
                                            {other?.business_name ?? other?.full_name ?? "Unknown"}
                                        </p>
                                        <p className="text-xs text-body/60 truncate">
                                            {lastPreviewByConv[conv.id] ?? ""}
                                        </p>
                                    </div>
                                    {unread > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            {unread}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Thread — hidden on mobile until a conversation is selected */}
            <div className={`${selectedConvId ? "flex" : "hidden"} sm:flex flex-1 flex-col`}>
                {!selectedConvId ? (
                    <div className="flex-1 flex items-center justify-center text-sm font-supporting text-body">
                        Select a conversation or start a new one.
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-border flex items-center gap-3">
                            <button
                                onClick={() => setSelectedConvId(null)}
                                className="sm:hidden text-heading"
                                aria-label="Back to conversations"
                            >
                                ←
                            </button>
                            <p className="font-semibold text-heading">
                                {selectedProfile?.business_name ?? selectedProfile?.full_name ?? "Conversation"}
                            </p>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {messages.map((m) => {
                                const isMine = m.sender_id === myId;
                                return (
                                    <div
                                        key={m.id}
                                        className={`max-w-xs rounded-2xl px-4 py-2.5 ${isMine
                                                ? "self-end bg-primary text-white"
                                                : "self-start bg-mint/40 text-heading"
                                            }`}
                                    >
                                        {m.photo_url && (
                                            <img src={m.photo_url} alt="" className="rounded-lg mb-1.5 max-h-48" />
                                        )}
                                        {m.content && <p className="text-sm">{m.content}</p>}
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSend} className="p-4 border-t border-border flex items-center gap-2">
                            <label className="cursor-pointer text-body/60 hover:text-primary transition">
                                📎
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setComposerFile(e.target.files?.[0] ?? null)}
                                />
                            </label>
                            {composerFile && (
                                <span className="text-xs text-body/60 truncate max-w-[100px]">{composerFile.name}</span>
                            )}
                            <input
                                type="text"
                                value={composerText}
                                onChange={(e) => setComposerText(e.target.value)}
                                placeholder="Type a message…"
                                className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className="bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<p className="font-supporting text-sm text-body p-6">Loading...</p>}>
            <MessagesPageContent />
        </Suspense>
    );
}
