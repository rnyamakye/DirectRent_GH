import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "react-hot-toast";
import { PageTransition } from "@/components/page-transition";
import { Suspense } from "react";
import { NavigationLoader } from "@/components/navigation-loader";
import { CookieConsent } from "@/components/cookie-consent";
import { AdSidebar } from "@/components/ad-sidebar";
import { AdMobileBanner } from "@/components/ad-mobile-banner";
import { AdHorizontalBanner } from "@/components/ad-horizontal-banner";
import { AdFooterBanner } from "@/components/ad-footer-banner";
import { AdSenseScript } from "@/components/ad-unit";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-primary",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-supporting",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DirectRent GH",
  description: "Find rental rooms and trusted local artisans across Ghana.",
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {isLoggedIn && <AdSenseScript />}
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-body font-sans pb-16 md:pb-0" suppressHydrationWarning>
        <ThemeProvider>
          <Header className="" />
          {isLoggedIn && <AdMobileBanner />}
          <div className="flex-1 flex flex-row justify-center w-full max-w-[1920px] mx-auto relative">
            {isLoggedIn && <AdSidebar side="left" />}
            <div className="flex-1 flex flex-col min-h-screen relative max-w-full">
              <Suspense><PageTransition>
                {children}
                {modal}
              </PageTransition></Suspense>
            </div>
            {isLoggedIn && <AdSidebar side="right" />}
          </div>
          {isLoggedIn && <AdHorizontalBanner />}
          {isLoggedIn && <AdFooterBanner />}
          <Footer />
          <MobileNav />
          <Suspense><NavigationLoader /></Suspense>
          <CookieConsent />
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
