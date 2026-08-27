import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AgentToursClient } from "./tours-client";

export default async function AgentToursPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/agent/tours");
  }

  // Ensure they are an agent
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "agent") {
    redirect("/");
  }

  // Fetch tour requests for this agent
  const { data: tours, error } = await supabase
    .from("tour_requests")
    .select(`
      id,
      renter_id,
      tour_date,
      tour_time,
      tour_type,
      status,
      created_at,
      listings!tour_requests_listing_id_fkey (
        title,
        landmark
      ),
      profiles!tour_requests_renter_id_fkey (
        full_name,
        phone,
        email
      )
    `)
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agent tours:", error);
  }

  const allTours = tours || [];

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">

        <h1 className="text-3xl font-bold text-heading">Property Tours</h1>
        <p className="text-body">Manage physical and virtual tour requests from renters.</p>
      </div>

      <AgentToursClient initialTours={allTours} />
    </main>
  );
}
