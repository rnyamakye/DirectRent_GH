"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UnreadMessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  // Use a ref so the client instance is stable across renders and
  // never causes useEffect / useCallback to re-fire.
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let currentUserId: string | null = null;

    const fetchCount = async (userId: string) => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", userId);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      currentUserId = user.id;

      // Fetch initial count
      await fetchCount(user.id);

      // Subscribe once — re-fetch true count on every change.
      channel = supabase
        .channel(`unread-messages-badge-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          async (payload) => {
            // Play alert only for new unread messages from others
            if (payload.eventType === "INSERT") {
              const newMsg = payload.new as any;
              if (newMsg.sender_id !== currentUserId && !newMsg.read_at) {
                const { playNotificationAlert } = await import("@/lib/audio");
                playNotificationAlert();
              }
            }
            if (currentUserId) await fetchCount(currentUserId);
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []); // Empty deps — supabase client is stable via ref

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
