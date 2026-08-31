import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ToursClient from "./tours-client";

export default async function AgentToursPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch tour requests for this agent
  const { data: tourRequests, error } = await supabase
    .from("tour_requests")
    .select(`
      id,
      tour_date,
      tour_time,
      tour_type,
      status,
      created_at,
      renter_id,
      listing_id
    `)
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agent tours:", error);
  }

  const tours = tourRequests || [];
  if (tours.length > 0) {
    const renterIds = [...new Set(tours.map((t) => t.renter_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone")
      .in("id", renterIds);
      
    if (profilesError) console.error("Profiles error:", profilesError);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    
    const listingIds = [...new Set(tours.map((t) => t.listing_id))];
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id, title, photo_urls, landmark")
      .in("id", listingIds);
      
    if (listingsError) console.error("Listings error:", listingsError);

    const listingMap = new Map(listings?.map((l) => [l.id, l]) || []);

    // Attach profile and listing to each tour
    for (const tour of tours) {
      (tour as any).renter = profileMap.get(tour.renter_id) || {
        id: tour.renter_id,
        full_name: "Unknown User",
        avatar_url: null,
        phone: null
      };
      
      (tour as any).listing = listingMap.get(tour.listing_id) || {
        id: tour.listing_id,
        title: "Unknown Listing",
        photo_urls: null,
        landmark: "Unknown Location"
      };
    }
  }

  return <ToursClient initialTours={tours} currentUserId={user.id} />;
}
