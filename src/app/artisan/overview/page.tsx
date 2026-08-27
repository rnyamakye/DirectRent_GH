import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtisanBookingsClient } from "./bookings-client";
export default async function ArtisanOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/artisan/overview");
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
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      renter_id,
      booking_date,
      booking_time,
      location,
      status,
      created_at,
      profiles!bookings_renter_id_fkey(full_name, phone, email)
    `)
    .eq("artisan_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("target_type", "artisan")
    .eq("target_id", user.id);

  let avgRatingStr = "—";
  if (reviewsData && reviewsData.length > 0) {
    const sum = reviewsData.reduce((acc, row) => acc + row.rating, 0);
    avgRatingStr = (sum / reviewsData.length).toFixed(1);
  }

  const allBookings = bookings || [];
  const pendingBookings = allBookings.filter(b => b.status === "pending");
  const confirmedBookings = allBookings.filter(b => b.status === "confirmed");

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">Pending</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide">Confirmed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wide">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wide">{status}</span>;
    }
  }

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 pt-5 flex flex-col lg:flex-row gap-12 lg:items-start">
      {/* Left Sidebar */}
      <div className="flex flex-col gap-8 lg:w-1/3 xl:w-1/4 lg:sticky lg:top-24">
        <div className="bg-white rounded-3xl p-8 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-border/50 flex flex-col items-center text-center w-full">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-mint flex items-center justify-center text-4xl text-primary font-bold">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.business_name ?? profile?.full_name ?? "Artisan"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(profile?.business_name ?? profile?.full_name ?? "A").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-heading mt-5">{profile?.business_name ?? profile?.full_name ?? "Artisan"}</h1>
          <div className="flex items-center gap-1 font-bold text-sm text-heading mt-1">
            <span className="uppercase tracking-widest text-primary">Artisan</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-10 lg:w-2/3 xl:w-3/4 mt-8 lg:mt-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-heading">
            Overview
          </h2>
          <p className="text-body">Overview of your bookings and performance.</p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="border border-border rounded-2xl p-6 bg-card flex flex-col gap-2 shadow-sm">
            <p className="text-body/70 font-semibold text-sm uppercase tracking-wider text-nowrap">Avg Rating</p>
            <p className="text-4xl font-bold text-heading flex items-center gap-1">{avgRatingStr !== "—" ? <>★ {avgRatingStr}</> : "—"}</p>
          </div>
          <div className="border border-border rounded-2xl p-6 bg-card flex flex-col gap-2 shadow-sm">
            <p className="text-body/70 font-semibold text-sm uppercase tracking-wider text-nowrap">Bookings</p>
            <p className="text-4xl font-bold text-heading">{allBookings.length}</p>
          </div>
          <div className="border border-border rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
            <p className=" font-semibold text-sm uppercase tracking-wider">Pending Requests</p>
            <p className="text-4xl font-bold">{pendingBookings.length}</p>
          </div>
          <div className="border border-border rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
            <p className=" font-semibold text-sm uppercase tracking-wider">Confirmed</p>
            <p className="text-4xl font-bold">{confirmedBookings.length}</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-2xl font-bold text-heading">Recent Bookings</h2>
          <ArtisanBookingsClient initialBookings={allBookings} />
        </div>
      </div>
    </main>
  );
}
