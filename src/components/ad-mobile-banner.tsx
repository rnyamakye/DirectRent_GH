"use client";

import { useState } from "react";

export function AdMobileBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-slate-50 border-b border-border/50 py-3 px-4 flex items-center justify-between gap-3 2xl:hidden sticky top-0 z-40 shadow-sm">
      <div className="flex-1 flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ad
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-heading leading-tight">Your Ad Here</span>
          <span className="text-[10px] text-body/80 truncate">Reach renters across Ghana</span>
        </div>
      </div>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition"
        aria-label="Close advertisement"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
