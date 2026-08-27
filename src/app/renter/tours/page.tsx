import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RenterToursClient } from "./tours-client";

export default async function RenterToursPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/renter/tours");
  }

  // Ensure they are a renter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "renter") {
    redirect("/");
  }

  // Fetch tour requests for this renter
  const { data: tours, error } = await supabase
    .from("tour_requests")
    .select(`
      id,
      agent_id,
      listing_id,
      tour_date,
      tour_time,
      tour_type,
      status,
      created_at,
      listings!tour_requests_listing_id_fkey (
        title,
        landmark
      ),
      profiles!tour_requests_agent_id_fkey (
        full_name,
        phone,
        email
      )
    `)
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching renter tours:", error);
  }

  const allTours = tours || [];

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">

        <h1 className="text-3xl font-bold text-heading">My Tours</h1>
        <p className="text-body">Track and manage your requested property tours.</p>
      </div>

      <RenterToursClient initialTours={allTours} />
    </main>
  );
}
