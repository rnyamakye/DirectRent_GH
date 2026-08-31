"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Whenever the route actually changes, we are no longer navigating
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      
      // If it's opening in a new tab, or has download attr, ignore
      if (target.target === "_blank" || target.hasAttribute("download")) return;
      
      // If it's a modifier click (cmd+click, ctrl+click), ignore
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const currentUrl = window.location.pathname + window.location.search;
      const targetUrl = target.pathname + target.search;

      // If it's navigating to a different page, show the loader instantly!
      if (targetUrl !== currentUrl) {
        setIsNavigating(true);
      }
    };

    // We need to attach this to all links. Since links can be added dynamically,
    // event delegation on the document is best.
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        // Mock a currentTarget to reuse our logic
        handleAnchorClick({ 
          ...e, 
          currentTarget: anchor, 
          metaKey: e.metaKey, 
          ctrlKey: e.ctrlKey, 
          shiftKey: e.shiftKey, 
          altKey: e.altKey 
        } as unknown as MouseEvent);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
          <Spinner className="w-12 h-12 text-primary relative z-10" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-body/80 uppercase animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
