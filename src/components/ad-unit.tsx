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
      <div className={`flex flex-col items-center justify-center bg-slate-100 overflow-hidden ${className}`}>
        {fallback || (
          <img src="/demo-banner-ad.png" alt="Demo Ad" className="w-full h-full object-cover" />
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
