import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import ListingActions from "./listing-actions";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminListingsPage() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles!agent_id ( full_name, business_name, email )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load listings: {error.message}</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Content Moderation: Listings</h1>
        <p className="text-body font-supporting">Review and manage property listings.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-canvas border-b border-border text-sm font-semibold text-body">
              <th className="p-4">Listing details</th>
              <th className="p-4">Agent</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings?.map((listing) => (
              <tr key={listing.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <div className="font-bold text-heading truncate max-w-[250px]">{listing.title}</div>
                  <div className="text-xs text-body mt-0.5">{listing.area} • GHS {listing.price}</div>
                  <Link prefetch={false} href={`/listings/${listing.id}`} target="_blank" className="text-xs text-primary hover:underline mt-1 inline-block">
                    View public page ↗
                  </Link>
                </td>
                <td className="p-4">
                  <div className="font-bold text-heading text-sm">{listing.profiles?.full_name || "Unknown"}</div>
                  {listing.profiles?.business_name && <div className="text-xs text-body mt-0.5">{listing.profiles.business_name}</div>}
                </td>
                <td className="p-4 text-sm text-body">
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                </td>
                <td className="p-4">
                  <ListingActions id={listing.id} />
                </td>
              </tr>
            ))}
            {listings?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-body">No listings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
