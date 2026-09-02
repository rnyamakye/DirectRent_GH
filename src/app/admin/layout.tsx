import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminDesktopSidebar } from "@/components/admin/admin-desktop-sidebar";
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
      <AdminDesktopSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <AdminMobileNav />
        
        {children}
      </main>
    </div>
  );
}
