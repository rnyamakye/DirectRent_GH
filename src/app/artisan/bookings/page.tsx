import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtisanBookingsClient } from "./bookings-client";
export default async function ArtisanOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/artisan/bookings");
  }

  // Ensure they are an artisan
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, business_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "artisan") {
    redirect("/");
  }

  // Fetch bookings for this artisan
  const { data: bookingsData, error } = await supabase
    .from("bookings")
    .select(`
      id,
      renter_id,
      booking_date,
      booking_time,
      location,
      status,
      created_at
    `)
    .eq("artisan_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
  }

  // Manually fetch renter profiles
  const bookings = bookingsData || [];
  if (bookings.length > 0) {
    const renterIds = [...new Set(bookings.map((b) => b.renter_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", renterIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    
    // Attach profile to each booking to match expected shape
    for (const booking of bookings) {
      (booking as any).profiles = profileMap.get(booking.renter_id) || null;
    }
  }

  const activeBookings = bookings.filter((b) => b.status === "pending" || b.status === "confirmed" || b.status === "completed");

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 pt-5 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-heading">Bookings</h1>
        <p className="text-base text-body/80">Manage your pending, confirmed, and completed bookings.</p>
      </div>

      <div className="flex flex-col gap-4">
        <ArtisanBookingsClient initialBookings={activeBookings} />
      </div>
    </main>
  );
}
