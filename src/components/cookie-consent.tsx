"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("directrent_cookie_consent");
    if (!hasConsented) {
      // Small delay to not immediately pop up on load
      const timer = setTimeout(() => {
        setIsRendered(true);
        // Small delay to allow render before adding active class for transition
        setTimeout(() => setShowConsent(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("directrent_cookie_consent", "accepted");
    setShowConsent(false);
    setTimeout(() => setIsRendered(false), 300); // match transition duration
  };

  const declineCookies = () => {
    localStorage.setItem("directrent_cookie_consent", "declined");
    setShowConsent(false);
    setTimeout(() => setIsRendered(false), 300); // match transition duration
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none transition-all duration-300 transform ${
        showConsent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-4xl w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-heading mb-2">We value your privacy</h3>
          <p className="text-body text-sm leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. For more information, please read our{" "}
            <Link href="/privacy" className="text-primary hover:underline font-medium">
              Privacy & Cookie Policy
            </Link>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={declineCookies}
            className="px-6 py-2.5 rounded-xl border border-border bg-transparent text-heading font-semibold hover:bg-slate-50 transition text-sm"
          >
            Decline All
          </button>
          <button
            onClick={acceptCookies}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition text-sm shadow-md shadow-primary/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
