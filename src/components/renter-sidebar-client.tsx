"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LayoutDashboardIcon, HeartIcon, StarIcon, UserIcon } from "@/components/icons";

export function RenterSidebarClient() {
  const pathname = usePathname();

  if (pathname === "/renter/dashboard" || pathname === "/renter/dashboard/") {
    return null;
  }

  return (
    <DashboardSidebar
      title="My account"
      links={[
        { label: "Dashboard", href: "/renter/dashboard", icon: <LayoutDashboardIcon /> },
        { label: "Saved", href: "/renter/saved", icon: <HeartIcon /> },
        { label: "My reviews", href: "/renter/reviews", icon: <StarIcon /> },
        // ── Account settings group ──────────────────────────────────────
        {
          label: "Account settings",
          href: "/renter/profile",
          icon: <UserIcon />,
        },
        {
          label: "Personal information",
          href: "/renter/profile/personal",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          ),
          indent: true,
        },
        {
          label: "Login & security",
          href: "/renter/profile/security",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ),
          indent: true,
        },
        {
          label: "Notifications",
          href: "/renter/profile/notifications",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          ),
          indent: true,
        },
        {
          label: "Payments",
          href: "/renter/profile/payments",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          ),
          indent: true,
        },
      ]}
    />
  );
}
