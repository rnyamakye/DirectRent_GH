"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on dashboard/overview/messages pages as they are root-level or have their own custom back buttons
    if (pathname?.match(/\/(agent|renter|artisan)\/(dashboard|overview|messages)$/)) {
      setIsVisible(false);
      return;
    }

    // Only show if there is actually history to go back to
    setIsVisible(window.history.length > 1);
  }, [pathname]);

  // Don't render until client-side check is complete
  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-heading transition mb-4 self-start"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="w-4 h-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
