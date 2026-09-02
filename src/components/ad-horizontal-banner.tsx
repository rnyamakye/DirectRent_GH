"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ad-unit";

export function AdHorizontalBanner() {
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
  const isMarketingPage = pathname === "/" && isAuthenticated !== true;
  if (isMarketingPage) return null;

  const isTargetPage = pathname === "/" || pathname === "/about" || pathname === "/contact" || pathname?.startsWith("/blog");
  if (!isTargetPage) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="w-full h-auto min-h-[90px] md:min-h-[120px] rounded-2xl overflow-hidden shadow-sm relative">
        <AdUnit slot="5555555555" format="auto" className="w-full h-[90px] md:h-[120px]" />
      </div>
    </div>
  );
}
