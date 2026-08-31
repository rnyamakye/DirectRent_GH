"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    
    // 350ms delay gives background images and layout a chance to fetch and settle 
    // before un-hiding the DOM, preventing a flash of unstyled/unloaded content.
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-canvas">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
              <Spinner className="w-12 h-12 text-primary relative z-10" />
            </div>
            <p className="text-sm font-semibold tracking-wide text-body/60 uppercase animate-pulse">
              Loading DirectRent
            </p>
          </div>
        </div>
      )}
      <div
        className="flex-1 flex flex-col w-full h-full transition-opacity duration-300"
        style={{ opacity: isReady ? 1 : 0 }}
      >
        {children}
      </div>
    </>
  );
}
