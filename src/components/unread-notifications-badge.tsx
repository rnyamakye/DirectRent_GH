"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UnreadNotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  // Stable client reference — prevents useEffect from re-firing on every render.
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchCount = async (userId: string) => {
      const { count, error } = await supabase
        .from("in_app_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial count
      await fetchCount(user.id);

      // Subscribe once — always refetch true count on any change to avoid
      // double-counting when both the mobile badge and desktop bell are mounted.
      channel = supabase
        .channel(`unread-notifications-badge-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "in_app_notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await fetchCount(user.id);
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
