"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";

export function MobileNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role ?? null);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoaded(true);
    }
    loadRole();
  }, []);

  const getProfileLink = () => {
    if (role === "agent") return "/agent/profile";
    if (role === "artisan") return "/artisan/profile";
    if (role === "renter") return "/renter/dashboard";
    return "/auth/login";
  };

  const exploreIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const dashboardIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );

  const listingsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const profileIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const artisansIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const agentsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );

  const savedIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  const messagesIcon = (
    <div className="relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <UnreadMessagesBadge />
    </div>
  );

  const bookingsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  let navItems = [];

  if (role === "agent") {
    navItems = [
      { label: "Dashboard", href: "/agent/dashboard", icon: dashboardIcon },
      { label: "My Listings", href: "/agent/listings", icon: listingsIcon },
      { label: "Messages", href: "/agent/messages", icon: messagesIcon },
      { label: "Profile", href: getProfileLink(), icon: profileIcon },
    ];
  } else if (role === "artisan") {
    navItems = [
      { label: "Home", href: "/artisan/dashboard", icon: dashboardIcon },
      { label: "Bookings", href: "/artisan/bookings", icon: bookingsIcon },
      { label: "Messages", href: "/artisan/messages", icon: messagesIcon },
      { label: "Profile", href: getProfileLink(), icon: profileIcon },
    ];
  } else {
    navItems = [
      { label: "Agents", href: "/agents", icon: agentsIcon },
      { label: "Artisans", href: "/artisans", icon: artisansIcon },
      { label: "Explore", href: "/", icon: exploreIcon, isMain: true },
      { label: "Messages", href: "/renter/messages", icon: messagesIcon },
      { label: "Profile", href: getProfileLink(), icon: profileIcon },
    ];
  }

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down and we're past the top a bit, hide nav
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } 
      // If scrolling up or at the very top, show nav
      else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
    {isLoaded && isAuthenticated && (
    <nav 
      className={`fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border md:hidden pb-safe transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          if (item.isMain) {
            return (
              <Link prefetch={false}
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-end w-full h-full pb-2 relative z-10"
              >
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg border-[3px] border-white transition-transform ${isActive ? "bg-primary scale-105" : "bg-primary hover:scale-105"}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : "text-body/50"}`}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link prefetch={false}
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-primary" : "text-body/50 hover:text-body"
                }`}
            >
              <div className={`${isActive ? "scale-110 transition-transform" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    )}
    </>
  );
}
