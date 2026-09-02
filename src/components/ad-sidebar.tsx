"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ad-unit";

export function AdSidebar({ side }: { side: "left" | "right" }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      const checkAuth = async () => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      };
      checkAuth();
    }
  }, [pathname]);
  if (pathname?.startsWith("/admin")) return null;

  const isMarketingPage = pathname === "/" && isAuthenticated !== true;
  const isAdFreePage = isMarketingPage || pathname === "/about" || pathname === "/contact" || pathname?.startsWith("/blog") || pathname?.startsWith("/auth");
  if (isAdFreePage) return null;

  return (
    <div className="hidden 2xl:block w-[280px] shrink-0 bg-slate-50/30">
      <div className="h-full w-full py-24 px-4 flex flex-col items-center">
        <div className="sticky top-24 w-full h-[600px] overflow-hidden rounded-2xl shadow-sm">
          <AdUnit slot={side === 'left' ? "1234567890" : "0987654321"} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
