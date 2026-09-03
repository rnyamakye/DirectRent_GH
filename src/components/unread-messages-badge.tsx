"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationAlert } from "@/lib/audio";

export function UnreadMessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchCount = useCallback(async (userId: string) => {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", userId);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  }, [supabase]);

  useEffect(() => {
    let channel: any;
    let currentUserId: string | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      currentUserId = user.id;

      // Fetch initial count
      await fetchCount(user.id);

      // Re-fetch actual count from DB on every change — avoids double-counting
      // when both the mobile badge and header badge are mounted simultaneously.
      channel = supabase
        .channel(`unread-messages-badge-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            // Only play alert for new incoming unread messages
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new as any;
              if (newMsg.sender_id !== currentUserId && !newMsg.read_at) {
                playNotificationAlert();
              }
            }
            // Always refetch the true count from DB
            if (currentUserId) fetchCount(currentUserId);
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, fetchCount]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
