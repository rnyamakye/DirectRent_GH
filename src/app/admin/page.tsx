import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Dynamic page

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch metrics in parallel
  const [
    { count: usersCount },
    { count: agentsCount },
    { count: artisansCount },
    { count: listingsCount },
    { count: bookingsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "renter"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "agent"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "artisan"),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Renters", value: usersCount ?? 0, color: "text-blue-700" },
    { label: "Total Agents", value: agentsCount ?? 0, color: "text-emerald-700" },
    { label: "Total Artisans", value: artisansCount ?? 0, color: "text-orange-700" },
    { label: "Total Listings", value: listingsCount ?? 0, color: "text-purple-700" },
    { label: "Total Bookings", value: bookingsCount ?? 0, color: "text-rose-700" },
  ];

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-body font-supporting">Welcome to the DirectRent global administration panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col gap-2 ${stat.color.split(' ')[0]}`}>
            <span className={`text-sm font-bold uppercase tracking-wider opacity-80 ${stat.color.split(' ')[1]}`}>
              {stat.label}
            </span>
            <span className={`text-4xl font-extrabold ${stat.color.split(' ')[1]}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-heading mb-4">System Health</h2>
        <p className="text-sm font-supporting text-body leading-relaxed mb-6">
          All systems are operational. Real-time messaging, payments (Paystack), and booking engines are online.
        </p>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Online & Healthy</span>
        </div>
      </div>
    </div>
  );
}
