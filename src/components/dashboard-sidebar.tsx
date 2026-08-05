"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

export type SidebarLink = {
  label: string;
  href: string;
  icon: ReactNode;
  /** If true, renders indented with a connecting line — for sub-settings groups */
  indent?: boolean;
  /** If true, only exact pathname match counts as active */
  exact?: boolean;
};

export function DashboardSidebar({
  title = "Profile",
  links,
}: {
  title?: string;
  links: SidebarLink[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Find the currently active link for the mobile button label
  const activeLink = links.find((link) => {
    const isDashboard = link.href.endsWith("dashboard");
    const isActive = isDashboard || link.exact
      ? pathname === link.href
      : pathname === link.href || pathname.startsWith(link.href + "/");
    const isHub = !link.indent && links.some(l => l.indent && l.href.startsWith(link.href + "/"));
    return isHub ? pathname === link.href : isActive;
  }) || links[0];

  return (
    <>
      {/* Mobile Toggle Button — fixed tab on the left edge */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        className="sm:hidden fixed right-0 top-16 -translate-y-1/2 z-[45] flex items-center justify-center bg-white border border-r-0 border-border rounded-l-xl w-8 h-12 shadow-md"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-body">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[50] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 right-0 sm:left-0 z-[60] w-[280px] bg-white sm:bg-transparent border-l sm:border-l-0 sm:border-r border-border p-6 sm:p-0 
        transform transition-transform duration-300 ease-in-out shadow-2xl sm:shadow-none
        sm:relative sm:transform-none sm:w-[280px] sm:flex-shrink-0 sm:pr-8 sm:min-h-[calc(100vh-100px)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8 sm:mb-6">
          <h2 className="text-[28px] font-bold text-heading tracking-tight">
            {title}
          </h2>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden p-2 -mr-2 rounded-full hover:bg-black/5 transition text-body"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 pb-4 sm:pb-0 h-[calc(100vh-100px)] overflow-y-auto sm:h-auto sm:overflow-visible">
          {links.map((link) => {
            // Exact match for dashboard and hub pages; prefix match for sub-pages
            const isDashboard = link.href.endsWith("dashboard");
            const isActive = isDashboard || link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + "/");

            // Hub pages (e.g. /renter/profile) should only be active when exactly on that page
            const isHub = !link.indent && links.some(l => l.indent && l.href.startsWith(link.href + "/"));
            const finalActive = isHub ? pathname === link.href : isActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 rounded-[16px] transition whitespace-nowrap text-[15px] ${link.indent
                  ? "px-4 py-2.5 ml-4 sm:ml-5 border-l-2 border-border pl-4 text-sm"
                  : "px-5 py-3.5"
                  } ${finalActive
                    ? "bg-black/[0.06] font-semibold text-heading"
                    : "text-body/80 hover:bg-black/[0.03] font-medium hover:text-heading"
                  }`}
              >
                <div className={`flex-shrink-0 ${finalActive ? "text-heading" : "text-body/60"}`}>
                  {link.icon}
                </div>
                {link.label}
              </Link>
            );
          })}

          <div className="mt-auto pt-4 sm:hidden pb-6">
            <SignOutButton className="flex w-fit items-center gap-4 rounded-[16px] transition whitespace-nowrap text-[15px] px-5 py-3.5 text-red-600 hover:bg-red-50 font-medium">
              <div className="flex-shrink-0 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>

            </SignOutButton>
          </div>
        </nav>
      </aside>
    </>
  );
}
