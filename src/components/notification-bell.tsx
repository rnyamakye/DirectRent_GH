"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type InAppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    async function fetchNotifications() {
      const { data } = await supabase
        .from("in_app_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    }
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel("in_app_notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "in_app_notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as InAppNotification;
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((count) => count + 1);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as InAppNotification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
            // Recalculate unread count
            setUnreadCount((prevCount) => {
              const old = payload.old as InAppNotification;
              if (old.is_read && !updated.is_read) return prevCount + 1;
              if (!old.is_read && updated.is_read) return Math.max(0, prevCount - 1);
              return prevCount;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function handleMarkAsRead(id: string) {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.is_read) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    await supabase
      .from("in_app_notifications")
      .update({ is_read: true })
      .eq("id", id);
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase
      .from("in_app_notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition text-body hover:text-heading"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-heading text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary-hover"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">🔔</span>
                <p className="text-sm font-medium text-heading">No notifications yet</p>
                <p className="text-xs text-body/60 mt-1">When you get updates, they'll appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => {
                  const content = (
                    <div 
                      className={twMerge(
                        "p-4 border-b border-border transition hover:bg-slate-50 cursor-pointer text-left w-full",
                        !notif.is_read ? "bg-mint/10" : ""
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={twMerge("text-sm font-bold", !notif.is_read ? "text-heading" : "text-heading/80")}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-body/50 whitespace-nowrap">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-body mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  );

                  return notif.link ? (
                    <Link 
                      key={notif.id} 
                      href={notif.link}
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        setIsOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button 
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-left w-full"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border bg-slate-50 text-center">
            <Link 
              href="/profile/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary hover:text-primary-hover uppercase tracking-widest"
            >
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
