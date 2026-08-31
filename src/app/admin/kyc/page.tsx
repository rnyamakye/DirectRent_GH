import { createClient } from "@/lib/supabase/server";
import { KycActions } from "./kyc-actions";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminKycPage() {
  const supabase = await createClient();

  const { data: requestsData, error } = await supabase
    .from("verification_requests")
    .select("*, profiles(full_name, email, role)")
    .order("created_at", { ascending: false });

  const requests = requestsData || [];

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">KYC Verifications</h1>
        <p className="text-body font-supporting">Review and approve identity verification documents.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-body">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
              🛡️
            </div>
            <p className="font-semibold text-lg">No pending requests</p>
            <p className="text-sm">All verifications are caught up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">User</th>
                  <th className="px-6 py-4 font-semibold text-heading">Role</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => {
                  const profile = (req.profiles as any) || {};
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-body whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-body">
                        <div className="font-medium text-heading">{profile.full_name || "Unknown"}</div>
                        <div className="text-xs opacity-70">{profile.email || "N/A"}</div>
                        <Link prefetch={false} 
                          href={profile.role === 'listing' ? `/listings/${req.user_id}` : profile.role === 'agent' ? `/agents/${req.user_id}` : `/artisans/${req.user_id}`} 
                          className="text-[10px] uppercase font-bold text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                          {profile.role || "Renter"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <KycActions 
                          requestId={req.id}
                          documentUrl={req.document_url}
                          status={req.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
