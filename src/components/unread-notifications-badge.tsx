"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function UnreadNotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchCount = useCallback(async (userId: string) => {
    const { count, error } = await supabase
      .from("in_app_notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  }, [supabase]);

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial count
      await fetchCount(user.id);

      // Re-fetch the true count from DB on every change — avoids increment/decrement
      // race conditions when both mobile badge and desktop bell are mounted together.
      channel = supabase
        .channel(`unread-notifications-badge-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'in_app_notifications', filter: `user_id=eq.${user.id}` },
          () => {
            fetchCount(user.id);
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
