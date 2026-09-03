"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ad-unit";

export function AdFooterBanner() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adImage, setAdImage] = useState<string>("/footer-banner-ad.png");
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
    
    // Alternate ad image on navigation
    setAdImage(Math.random() > 0.5 ? "/footer-banner-ad.png" : "/footer-banner-ad-2.png");
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const isMarketingPage = pathname === "/" && isAuthenticated !== true;
  const isAdFreePage = isMarketingPage || pathname === "/about" || pathname === "/contact" || pathname?.startsWith("/blog") || pathname?.startsWith("/auth");
  if (isAdFreePage) return null;

  const footerAdMedia = (
    <img 
      src={adImage} 
      alt="Demo Footer Ad" 
      className="w-full h-full object-cover" 
    />
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="w-full h-auto min-h-[90px] md:min-h-[120px] rounded-none overflow-hidden shadow-sm relative">
        <AdUnit 
          slot="3333333333" 
          format="auto" 
          className="w-full h-[90px] md:h-[120px]" 
          fallback={footerAdMedia}
        />
      </div>
    </div>
  );
}
