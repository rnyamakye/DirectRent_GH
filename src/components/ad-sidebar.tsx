"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/ad-unit";

export function AdSidebar({ side }: { side: "left" | "right" }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeAd, setActiveAd] = useState<{type: 'video' | 'image', src: string}>({
    type: side === 'left' ? 'video' : 'image',
    src: side === 'left' ? "/Brown and White Minimalist Shadow Natural Skincare YouTube Vertical Ad.mp4" : "/White Gold Elegant Business Card Vertical.png"
  });
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
    
    // Alternate ad media
    const ads: {type: 'video'|'image', src: string}[] = [
      { type: 'video', src: "/Brown and White Minimalist Shadow Natural Skincare YouTube Vertical Ad.mp4" },
      { type: 'image', src: "/White Gold Elegant Business Card Vertical.png" },
      { type: 'video', src: "/Blue Black Gradient Fashion Sale YouTube Vertical Ad.mp4" }
    ];
    setActiveAd(ads[Math.floor(Math.random() * ads.length)]);
  }, [pathname]);
  if (pathname?.startsWith("/admin")) return null;

  const isMarketingPage = pathname === "/" && isAuthenticated !== true;
  const isAdFreePage = isMarketingPage || pathname === "/about" || pathname === "/contact" || pathname?.startsWith("/blog") || pathname?.startsWith("/auth");
  if (isAdFreePage) return null;

  const adMedia = activeAd.type === 'video' ? (
    <video 
      src={activeAd.src} 
      autoPlay 
      loop 
      muted 
      playsInline
      className="w-full h-full object-cover" 
    />
  ) : (
    <img 
      src={activeAd.src} 
      alt="Demo Vertical Ad" 
      className="w-full h-full object-cover" 
    />
  );

  return (
    <div className="hidden 2xl:block w-[280px] shrink-0 bg-slate-50/30">
      <div className="h-full w-full py-24 px-4 flex flex-col items-center">
        <div className="sticky top-24 w-full h-[calc(100vh-8rem)] overflow-hidden rounded-none shadow-sm">
          <AdUnit 
            slot={side === 'left' ? "1234567890" : "0987654321"} 
            className="w-full h-full" 
            fallback={adMedia}
          />
        </div>
      </div>
    </div>
  );
}
