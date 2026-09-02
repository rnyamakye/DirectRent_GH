"use client";

import { useTheme } from "next-themes";
import * as React from "react";

export function ThemePreferenceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm animate-pulse h-full min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-heading/20 transition-all duration-200 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200 relative">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`w-6 h-6 absolute transition-all duration-300 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`w-6 h-6 absolute transition-all duration-300 ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <h2 className="text-base font-bold text-heading group-hover:text-primary transition-colors">Appearance</h2>
        <p className="text-sm text-body/70 leading-relaxed">Toggle between light and dark themes to customize your viewing experience.</p>
      </div>
      <div className="flex items-center justify-between w-full mt-2">
        <span className="text-sm font-semibold text-body/50 group-hover:text-primary transition-colors">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${isDark ? 'bg-primary justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
            <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
}
