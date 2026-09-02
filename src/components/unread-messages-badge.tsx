"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationAlert } from "@/lib/audio";

export function UnreadMessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Fetch initial unread count
      // RLS ensures they only see messages in conversations they are a part of
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", user.id);

      if (!error && count !== null) {
        setUnreadCount(count);
      }

      // Subscribe to changes in messages table
      channel = supabase
        .channel(`unread-messages-${Math.random().toString(36).substring(2)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new as any;
              // If someone else sent a message and it's unread
              if (newMsg.sender_id !== user.id && !newMsg.read_at) {
                setUnreadCount((prev) => prev + 1);
                playNotificationAlert();
              }
            } else if (payload.eventType === 'UPDATE') {
              const oldMsg = payload.old as any;
              const newMsg = payload.new as any;
              // If it changed from unread to read
              if (newMsg.sender_id !== user.id && !oldMsg.read_at && newMsg.read_at) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }
            }
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
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
