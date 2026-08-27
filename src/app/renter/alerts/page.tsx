import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertsClient } from "./alerts-client";

export const revalidate = 0;

export default async function RenterAlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/renter/alerts");
  }

  const { data: alerts, error } = await supabase
    .from("search_alerts")
    .select("*")
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch alerts:", error);
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-heading mb-2">Saved Searches</h1>
        <p className="text-body font-supporting">
          Manage your search alerts. We'll notify you when a new property matching these criteria is listed.
        </p>
      </div>

      <AlertsClient initialAlerts={alerts || []} />
    </div>
  );
}
