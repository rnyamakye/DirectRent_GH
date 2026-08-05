"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

// Routes whose prefix should NOT show the footer.
const HIDDEN_ON = [
  "/auth",
  "/renter/profile",
  "/agent/profile",
  "/artisan/profile",
  "/agents/",
  "/artisans/"
];

export function ConditionalFooter() {
  const pathname = usePathname();
  const hide = HIDDEN_ON.some((prefix) => pathname.startsWith(prefix));
  if (hide) return null;
  return <Footer />;
}
