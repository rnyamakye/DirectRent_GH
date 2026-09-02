"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UnreadNotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial unread count
      const { count, error } = await supabase
        .from("in_app_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }

      // Subscribe to changes in in_app_notifications table
      channel = supabase
        .channel(`unread-notifications-mobile-${Math.random().toString(36).substring(2)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'in_app_notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as any;
              if (!newNotif.is_read) {
                setUnreadCount((prev) => prev + 1);
              }
            } else if (payload.eventType === 'UPDATE') {
              const oldNotif = payload.old as any;
              const newNotif = payload.new as any;
              if (!oldNotif.is_read && newNotif.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              } else if (oldNotif.is_read && !newNotif.is_read) {
                setUnreadCount((prev) => prev + 1);
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
  }, [supabase]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
