"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sm:hidden p-4 border-b border-border bg-card flex justify-between items-center relative z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-1.5 -ml-1.5 text-body hover:bg-slate-100 rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <Link prefetch={false} href="/admin" className="font-bold text-lg text-primary tracking-tight">
            DirectRent Admin
          </Link>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 flex sm:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsOpen(false)} 
        />
        <div 
          className={`relative w-[280px] bg-card h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <Link prefetch={false} href="/admin" onClick={() => setIsOpen(false)} className="font-bold text-xl text-primary tracking-tight flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  DirectRent
                </Link>
                <span className="text-xs font-bold uppercase tracking-wider text-body/60 mt-1 block">Admin Panel</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 -mt-2 text-body hover:bg-slate-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Dashboard Overview
              </Link>

              <div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-body/50">Moderation</div>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/reports" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading flex items-center justify-between">
                Reports & Flags
                <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold">New</span>
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/users" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                User Accounts
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/listings" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Listings
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/reviews" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Reviews
              </Link>

              <div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-body/50">Content</div>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/blog" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Blog Posts CMS
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/faqs" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Help Center FAQs
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/support" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading flex items-center justify-between">
                Support Tickets
                <span className="bg-orange-100 text-orange-700 text-xs py-0.5 px-2 rounded-full font-bold">New</span>
              </Link>
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/admin/newsletter" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
                Newsletter Subscribers
              </Link>
            </nav>
            <div className="p-4 border-t border-border">
              <Link onClick={() => setIsOpen(false)} prefetch={false} href="/" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
    </>
  );
}
