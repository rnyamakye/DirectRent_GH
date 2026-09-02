"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ad-unit";

export function AdMobileBanner() {
  const [isCollapsedManually, setIsCollapsedManually] = useState(false);
  const [showOnScroll, setShowOnScroll] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsCollapsedManually(false);
    setShowOnScroll(true);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < lastScrollY || currentScrollY < 50) {
          setShowOnScroll(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setShowOnScroll(false);
        }
        
        setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollY]);

  if (pathname?.startsWith("/admin")) return null;

  const isMarketingPage = pathname === "/" && isAuthenticated !== true;
  const isAdFreePage = isMarketingPage || pathname === "/about" || pathname === "/contact" || pathname?.startsWith("/blog") || pathname?.startsWith("/auth");
  
  if (isAdFreePage) return null;

  const isExpanded = !isCollapsedManually && showOnScroll;

  return (
    <div className={`w-full bg-slate-50 md:hidden sticky top-0 z-40 transition-all duration-300 ${isExpanded ? 'translate-y-0' : '-translate-y-full'} ${isCollapsedManually ? 'h-0 border-b-0' : 'h-[96px] border-b'} border-border/50 shadow-sm`}>
      <div className={`w-full relative flex items-start p-2 h-full overflow-hidden`}>
        <div className="flex-1 w-full h-[80px]">
          <AdUnit slot="1111111111" format="auto" className="w-full h-full" />
        </div>
      </div>
      
      <button 
        onClick={() => {
          if (isExpanded) {
            setIsCollapsedManually(true);
          } else {
            setIsCollapsedManually(false);
            setShowOnScroll(true);
          }
        }}
        className={`absolute right-6 -bottom-8 w-12 h-8 shrink-0 flex items-center justify-center rounded-b-xl bg-slate-50 border border-t-0 border-border/50 text-slate-600 hover:bg-slate-200 transition-all shadow-md z-10`}
        aria-label={isExpanded ? "Collapse advertisement" : "Expand advertisement"}
      >
        {isExpanded ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>
    </div>
  );
}
