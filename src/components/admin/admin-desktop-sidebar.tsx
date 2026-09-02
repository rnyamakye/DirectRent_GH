"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AdminDesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Basic SVGs for our admin sections
  const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    listings: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    reviews: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    blog: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    faqs: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    support: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    newsletter: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    exit: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  };

  const moderationLinks = [
    { label: "Reports & Flags", href: "/admin/reports", icon: icons.reports, badge: "New" },
    { label: "User Accounts", href: "/admin/users", icon: icons.users },
    { label: "Listings", href: "/admin/listings", icon: icons.listings },
    { label: "Reviews", href: "/admin/reviews", icon: icons.reviews },
  ];

  const contentLinks = [
    { label: "Blog Posts CMS", href: "/admin/blog", icon: icons.blog },
    { label: "Help Center FAQs", href: "/admin/faqs", icon: icons.faqs },
    { label: "Support Tickets", href: "/admin/support", icon: icons.support, badge: "New" },
    { label: "Newsletter Subscribers", href: "/admin/newsletter", icon: icons.newsletter },
  ];

  return (
    <aside className={`bg-card border-r border-border flex-col hidden sm:flex transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-card border border-border shadow-sm rounded-full p-1 text-slate-500 hover:text-primary transition-colors z-10 hidden sm:flex"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className={`p-6 border-b border-border flex items-center min-h-[97px] ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}>
        {isCollapsed ? (
          <Link prefetch={false} href="/" className="flex items-center justify-center text-primary" title="DirectRent Admin">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
        ) : (
          <div>
            <Link prefetch={false} href="/" className="font-bold text-xl text-primary tracking-tight flex items-center gap-2 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              DirectRent
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-body/60 mt-2 block whitespace-nowrap">Admin Panel</span>
          </div>
        )}
      </div>

      <nav className={`flex-1 flex flex-col gap-2 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <Link 
          prefetch={false} 
          href="/admin" 
          title={isCollapsed ? "Dashboard Overview" : undefined}
          className={`flex items-center rounded-xl font-semibold text-sm transition-colors ${isActive('/admin') ? 'bg-mint/30 text-primary' : 'hover:bg-mint/30 text-heading'} ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}`}
        >
          <span className="shrink-0">{icons.dashboard}</span>
          {!isCollapsed && <span className="whitespace-nowrap">Dashboard Overview</span>}
        </Link>

        <div className={`mt-4 mb-2 text-xs font-bold uppercase tracking-wider text-body/50 ${isCollapsed ? 'text-center' : 'px-4'}`}>
          {isCollapsed ? 'Mod' : 'Moderation'}
        </div>
        
        {moderationLinks.map(link => (
          <Link 
            key={link.href}
            prefetch={false} 
            href={link.href} 
            title={isCollapsed ? link.label : undefined}
            className={`flex items-center rounded-xl font-semibold text-sm transition-colors relative ${isActive(link.href) ? 'bg-mint/30 text-primary' : 'hover:bg-mint/30 text-heading'} ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'}`}
          >
            <span className="shrink-0">{link.icon}</span>
            {!isCollapsed && <span className="whitespace-nowrap flex-1">{link.label}</span>}
            {!isCollapsed && link.badge && (
              <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold">
                {link.badge}
              </span>
            )}
            {isCollapsed && link.badge && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>
        ))}

        <div className={`mt-4 mb-2 text-xs font-bold uppercase tracking-wider text-body/50 ${isCollapsed ? 'text-center' : 'px-4'}`}>
          {isCollapsed ? 'CMS' : 'Content'}
        </div>
        
        {contentLinks.map(link => (
          <Link 
            key={link.href}
            prefetch={false} 
            href={link.href} 
            title={isCollapsed ? link.label : undefined}
            className={`flex items-center rounded-xl font-semibold text-sm transition-colors relative ${isActive(link.href) ? 'bg-mint/30 text-primary' : 'hover:bg-mint/30 text-heading'} ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'}`}
          >
            <span className="shrink-0">{link.icon}</span>
            {!isCollapsed && <span className="whitespace-nowrap flex-1">{link.label}</span>}
            {!isCollapsed && link.badge && (
              <span className="bg-orange-100 text-orange-700 text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold">
                {link.badge}
              </span>
            )}
            {isCollapsed && link.badge && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
            )}
          </Link>
        ))}
      </nav>
      
      <div className={`border-t border-border ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <Link 
          prefetch={false} 
          href="/" 
          title={isCollapsed ? "Exit Admin" : undefined}
          className={`flex items-center rounded-xl font-semibold text-sm hover:bg-red-50 text-red-600 transition-colors ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}`}
        >
          <span className="shrink-0">{icons.exit}</span>
          {!isCollapsed && <span className="whitespace-nowrap">Exit Admin</span>}
        </Link>
      </div>
    </aside>
  );
}
