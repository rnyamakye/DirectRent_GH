"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface ProfileCompletenessCardProps {
  completenessPercent: number;
  role: "agent" | "artisan" | "renter";
  className?: string;
  isArtisanLayout?: boolean;
}

export function ProfileCompletenessCard({ completenessPercent, role, className, isArtisanLayout }: ProfileCompletenessCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem(`profile-completeness-dismissed-${role}`) === "true") {
      setIsVisible(false);
    }
  }, [role]);

  if (completenessPercent >= 100) return null;
  if (isMounted && !isVisible) return null;

  const dismiss = () => {
    localStorage.setItem(`profile-completeness-dismissed-${role}`, "true");
    setIsVisible(false);
  };

  const cardContent = (
    <div className={twMerge("rounded-2xl border border-border bg-card p-6 flex flex-col gap-5 relative group shadow-sm", className)}>
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-body/40 hover:text-heading transition-colors bg-card/80 hover:bg-card rounded-full p-1.5 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="flex justify-between items-end">
        {!isArtisanLayout && <h2 className="text-xl font-semibold text-heading">Profile completeness</h2>}
        {isArtisanLayout ? (
           <p className="text-4xl font-bold text-heading">{completenessPercent}%</p>
        ) : (
           <p className="text-2xl font-bold text-heading">{completenessPercent}%</p>
        )}
      </div>
      <div className="w-full h-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completenessPercent}%` }}
        />
      </div>
      <div>
        <p className="text-sm text-body/70 mb-4">
          A complete profile gets more views and builds trust with potential clients.
        </p>
        <Link
          href={`/${role}/profile/edit`}
          className="inline-block bg-heading hover:bg-black text-white rounded-full px-5 py-2 text-sm font-bold transition"
        >
          Complete your profile
        </Link>
      </div>
    </div>
  );

  if (isArtisanLayout) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div>
          <h2 className="text-xl font-semibold text-heading mb-6">Profile completeness</h2>
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
