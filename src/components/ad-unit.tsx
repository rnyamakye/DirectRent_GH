"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Injects the global Google AdSense script.
 * Should be placed once in the root layout.
 */
export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  layoutKey?: string;
  responsive?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders a Google AdSense slot if the client ID is present.
 * Otherwise, renders a visual fallback placeholder for development.
 */
export function AdUnit({
  slot,
  format = "auto",
  layoutKey,
  responsive = true,
  className = "",
  fallback,
}: AdUnitProps) {
  const pathname = usePathname();
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Next.js route transitions don't automatically trigger AdSense to refresh.
  // We re-push the ad to the adsbygoogle array when the pathname changes.
  useEffect(() => {
    if (clientId && typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error", err);
      }
    }
  }, [pathname, clientId]);

  if (!clientId) {
    // Development mode fallback when no Client ID is provided
    return (
      <div className={`flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-slate-50 text-center ${className}`}>
        {fallback || (
          <>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              Advertisement
            </span>
            <div className="w-12 h-12 rounded-full bg-slate-200 mb-2 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-heading">Your Ad Here</h4>
            <p className="text-[10px] text-body/80 mt-1 max-w-[200px]">
              Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in .env.local to enable real ads.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      {...(responsive ? { "data-full-width-responsive": "true" } : {})}
    />
  );
}
