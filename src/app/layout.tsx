import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "react-hot-toast";
import { PageTransition } from "@/components/page-transition";
import { NavigationLoader } from "@/components/navigation-loader";
import { CookieConsent } from "@/components/cookie-consent";
import { AdSidebar } from "@/components/ad-sidebar";
import { AdMobileBanner } from "@/components/ad-mobile-banner";
import { AdHorizontalBanner } from "@/components/ad-horizontal-banner";
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

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-canvas text-body font-sans pb-16 md:pb-0" suppressHydrationWarning>
        <Header className="" />
        <div className="flex-1 flex flex-row justify-center w-full max-w-[1920px] mx-auto relative">
          <div className="hidden 2xl:block w-[280px] shrink-0 border-r border-border/50 bg-slate-50/30">
            <AdSidebar side="left" />
          </div>
          <div className="flex-1 flex flex-col min-h-screen relative max-w-full overflow-hidden">
            <AdMobileBanner />
            <PageTransition>
              {children}
              {modal}
            </PageTransition>
          </div>
          <div className="hidden 2xl:block w-[280px] shrink-0 border-l border-border/50 bg-slate-50/30">
            <AdSidebar side="right" />
          </div>
        </div>
        <AdHorizontalBanner />
        <Footer />
        <MobileNav />
        <NavigationLoader />
        <CookieConsent />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
