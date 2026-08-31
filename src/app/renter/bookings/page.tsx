import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RenterBookingsClient } from "./bookings-client";

export default async function RenterBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/renter/bookings");
  }

  // Fetch bookings for this renter
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      artisan_id,
      booking_date,
      booking_time,
      location,
      status,
      created_at,
      artisan_profiles!bookings_artisan_id_fkey (
        trade,
        profiles!artisan_profiles_id_fkey (
          full_name,
          phone,
          avatar_url
        )
      )
    `)
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching renter bookings:", error);
  }

  const allBookings = bookings || [];

  return (
    <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-heading">My Bookings</h1>
        <p className="text-body">Track and manage your requested services.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {allBookings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-4">📅</span>
            <h3 className="text-lg font-bold text-heading">No bookings yet</h3>
            <p className="text-body mt-1 max-w-sm">When you request a service from an artisan, you can track it here.</p>
            <Link prefetch={false} href="/artisans" className="mt-6 bg-primary text-white rounded-full px-6 py-2.5 font-bold transition hover:bg-primary-hover">
              Find an Artisan
            </Link>
          </div>
        ) : (
          <RenterBookingsClient initialBookings={allBookings} />
        )}
      </div>
    </main>
  );
}
