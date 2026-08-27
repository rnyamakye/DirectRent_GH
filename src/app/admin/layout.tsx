import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden sm:flex">
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-bold text-xl text-primary tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            DirectRent
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-body/60 mt-2 block">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <Link href="/admin" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Dashboard Overview
          </Link>

          <div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-body/50">Moderation</div>
          <Link href="/admin/reports" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading flex items-center justify-between">
            Reports & Flags
            <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold">New</span>
          </Link>
          <Link href="/admin/users" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            User Accounts
          </Link>
          <Link href="/admin/listings" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Listings
          </Link>
          <Link href="/admin/reviews" className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Reviews
          </Link>

          <div className="mt-4 mb-2 px-4 text-xs font-bold uppercase tracking-wider text-body/50">Content</div>
          <Link href="/admin/blog" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Blog Posts CMS
          </Link>
          <Link href="/admin/faqs" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Help Center FAQs
          </Link>
          <Link href="/admin/support" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading flex items-center justify-between">
            Support Tickets
            <span className="bg-orange-100 text-orange-700 text-xs py-0.5 px-2 rounded-full font-bold">New</span>
          </Link>
          <Link href="/admin/newsletter" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-mint/30 transition-colors text-heading">
            Newsletter Subscribers
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="px-4 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sm:hidden p-4 border-b border-border bg-card flex justify-between items-center">
          <Link href="/admin" className="font-bold text-lg text-primary tracking-tight">
            DirectRent Admin
          </Link>
          <Link href="/" className="text-sm font-semibold text-body hover:text-primary">Exit</Link>
        </div>
        
        {children}
      </main>
    </div>
  );
}
