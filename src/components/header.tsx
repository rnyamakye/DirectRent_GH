"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  HomeIcon, ListingsIcon, ArtisansIcon, AgentsIcon,
  SavedIcon, InfoIcon, ContactIcon, BlogIcon, HelpIcon, MessageIcon
} from "@/components/icons";
import { NotificationBell } from "@/components/notification-bell";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll(); // initialize on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Sync auth state ──────────────────────────────────────────────────────
  useEffect(() => {
    let userId: string | null = null;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      userId = data.user?.id ?? null;

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, avatar_url")
          .eq("id", data.user.id)
          .single();
        setRole(profile?.role ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
      }
      setIsAuthLoaded(true);
    }
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      userId = session?.user?.id ?? null;

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, avatar_url")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
      } else {
        setRole(null);
        setAvatarUrl(null);
      }
    });

    // ── Realtime: re-fetch avatar whenever the user's profile row changes ──
    // This ensures the header avatar updates instantly after saving on the
    // profile edit page without requiring a full page reload.
    const channel = supabase
      .channel("header-profile-watch")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        async (payload) => {
          // Only react to changes for the currently-signed-in user
          if (payload.new && payload.new.id === userId) {
            setAvatarUrl((payload.new as { avatar_url?: string }).avatar_url ?? null);
          }
        }
      )
      .subscribe();

    return () => {
      listener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived display values ───────────────────────────────────────────────
  const initials = user?.email ? user.email[0].toUpperCase() : null;

  // ── Primary Navigation Links ──────────────────────────────────────────────
  let desktopLinks = [
    { label: "About", href: "/about", icon: <InfoIcon className="h-4 w-4" /> },
    { label: "Contact", href: "/contact", icon: <ContactIcon className="h-4 w-4" /> },
    { label: "Blog", href: "/blog", icon: <BlogIcon className="h-4 w-4" /> },
    { label: "Help", href: "/help", icon: <HelpIcon className="h-4 w-4" /> },
  ];

  if (user) {
    if (role === "agent") {
      desktopLinks = [];
    } else if (role === "artisan") {
      desktopLinks = [];
    } else {
      desktopLinks = [
        { label: "Explore", href: "/", icon: <HomeIcon className="h-4 w-4" /> },
        { label: "Listings", href: "/listings", icon: <ListingsIcon className="h-4 w-4" /> },
        { label: "Agents", href: "/agents", icon: <AgentsIcon className="h-4 w-4" /> },
        { label: "Artisans", href: "/artisans", icon: <ArtisansIcon className="h-4 w-4" /> },
        { label: "Saved", href: "/renter/saved", icon: <SavedIcon className="h-4 w-4" /> },
      ];
    }
  }


  if (pathname?.startsWith("/admin")) return null;

  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <div className={twMerge(
      "relative z-50 w-full transition-all duration-300",
      !isAuthLoaded ? "hidden md:block opacity-0" : (user || isAuthPage ? "hidden md:block" : "block")
    )}>
      <header
        className={twMerge(
          "transition-all duration-300 border-border bg-card/95 backdrop-blur-md",
          isScrolled
            ? "mt-5 mx-auto max-w-6xl border rounded-full shadow-sm px-2"
            : "mt-6 mx-auto max-w-6xl border-b rounded-full shadow-lg",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">

          {/* ── Left: Logo ── */}
          <div className="flex-1 flex items-center">
            <Link prefetch={false} href={role === "agent" ? "/agent/dashboard" : role === "artisan" ? "/artisan/dashboard" : "/"} className="font-bold text-xl text-primary flex items-center gap-2">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="h-8 w-8 fill-current">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.644-.673-.645.672-.257.26c-2.152 2.128-4.485 3.387-6.708 3.387-3.48 0-6.357-2.416-6.357-6.478 0-.858.146-1.781.539-3.113l.113-.373.118-.336c.952-2.618 5.076-11.226 7.156-15.253l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.573 2.254 0 2.534 1.636 3.978 3.857 3.978 1.488 0 3.197-.847 4.966-2.502l.663-.637.382-.36.382.36.663.637c1.769 1.655 3.478 2.502 4.966 2.502 2.221 0 3.857-1.444 3.857-3.978 0-.46-.098-.999-.441-2.046l-.23-.687c-.886-2.548-4.996-11.134-6.903-14.887l-.523-1.008C18.053 3.539 17.239 3 16 3z"></path>
              </svg>
              <span className="hidden lg:block">DirectRent GH</span>
            </Link>
          </div>

          {/* ── Center: Desktop Nav ── */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-4">
            {desktopLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link prefetch={false}
                  key={link.label}
                  href={link.href}
                  className={twMerge(
                    "relative group py-1 text-xs font-medium transition-colors hover:text-heading flex items-center gap-1.5",
                    isActive ? "text-heading" : "text-body"
                  )}
                >
                  {link.icon}
                  {link.label}
                  <span
                    className={twMerge(
                      "absolute left-0 -bottom-1.5 h-0.5 bg-primary transition-all duration-300 ease-out rounded-full",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ── Right: User Menu Pill ── */}
          <div className={twMerge(
            "flex-1 items-center justify-end gap-3",
            user ? "hidden md:flex" : "flex"
          )}>
            {user ? (
              <>
                {role === "agent" && (
                  <Link prefetch={false}
                    href="/agent/listings"
                    className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 text-body transition-colors relative"
                    title="My Listings"
                  >
                    <ListingsIcon className="h-5 w-5" />
                  </Link>
                )}
                <Link prefetch={false}
                  href={role ? `/${role}/messages` : "/messages"}
                  className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 text-body transition-colors relative"
                  title="Messages"
                >
                  <MessageIcon className="h-5 w-5" />
                  <UnreadMessagesBadge />
                </Link>
                <NotificationBell userId={user.id} />
                <Link prefetch={false}
                  href={role ? (role === "renter" ? "/renter/dashboard" : `/${role}/profile`) : "/auth/select-role"}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-500 text-white text-sm font-semibold overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : initials ? (
                    <span>{initials}</span>
                  ) : (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="h-full w-full fill-current text-white"><path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path></svg>
                  )}
                </Link>
              </>
            ) : (
              <Link prefetch={false} href="/auth/login" className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary-hover transition">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

    </div>
  );
}
