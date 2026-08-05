"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) return null;

  const items = [{ label: "Home", href: "/" }];

  if (segments[0] === "agent" || segments[0] === "artisan" || segments[0] === "renter") {
    items.push({ label: "Dashboard", href: `/${segments[0]}/dashboard` });

    if (segments[1] === "profile") {
      if (segments.length === 2) {
        items.push({ label: "Account Settings" });
      } else {
        items.push({ label: "Account Settings", href: `/${segments[0]}/profile` });

        if (segments[2] === "edit") items.push({ label: "Edit Public Profile" });
        else if (segments[2] === "personal") items.push({ label: "Personal Information" });
        else if (segments[2] === "security") items.push({ label: "Login & Security" });
        else if (segments[2] === "notifications") items.push({ label: "Notifications" });
        else if (segments[2] === "payments") items.push({ label: "Payments" });
        else if (segments[2] === "privacy") items.push({ label: "Privacy" });
      }
    } else if (segments[1] === "boost") {
      items.push({ label: "Boost Profile" });
    } else if (segments[1] === "reviews") {
      items.push({ label: "My Reviews" });
    } else if (segments[1] === "saved") {
      items.push({ label: "Saved" });
    }
  }

  // Remove the last item's href so it acts as the current page indicator
  if (items.length > 0) {
    delete items[items.length - 1].href;
  }

  // If we only have Home and Dashboard, we don't need this because the main dashboard page handles it itself.
  if (items.length <= 2) {
    return null;
  }

  return (
    <div className="mb-6">
      <Breadcrumbs items={items} />
    </div>
  );
}
