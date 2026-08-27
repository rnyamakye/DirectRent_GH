import { createClient } from "@/lib/supabase/server";
import { ReportActions } from "./report-actions";
import Link from "next/link";

export const revalidate = 0; // Ensure data is fresh

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const { data: reportsData, error } = await supabase
    .from("reports")
    .select("*, profiles!reports_reporter_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  const rawReports = reportsData || [];

  // Batch fetch target info for better UX
  const listingIds = rawReports.filter(r => r.target_type === 'listing').map(r => r.target_id);
  const profileIds = rawReports.filter(r => r.target_type === 'profile').map(r => r.target_id);

  const listingNames: Record<string, string> = {};
  const profileNames: Record<string, string> = {};
  const listingStatuses: Record<string, string> = {};
  const profileStatuses: Record<string, boolean> = {};

  if (listingIds.length > 0) {
    const { data: listings } = await supabase.from("listings").select("id, title, status").in("id", listingIds);
    listings?.forEach(l => {
      listingNames[l.id] = l.title;
      listingStatuses[l.id] = l.status;
    });
  }

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, is_suspended").in("id", profileIds);
    profiles?.forEach(p => {
      profileNames[p.id] = p.full_name || "Unknown User";
      profileStatuses[p.id] = p.is_suspended;
    });
  }

  const reports = rawReports.map(report => {
    let targetName = "Unknown Target";
    let isAlreadySuspended = false;

    if (report.target_type === 'listing') {
      targetName = listingNames[report.target_id] || "Listing Deleted/Unknown";
      isAlreadySuspended = listingStatuses[report.target_id] === 'unavailable';
    } else {
      targetName = profileNames[report.target_id] || "Profile Deleted/Unknown";
      isAlreadySuspended = !!profileStatuses[report.target_id];
    }

    return {
      ...report,
      reporterName: (report.profiles as any)?.full_name || "Anonymous",
      reporterEmail: (report.profiles as any)?.email || "N/A",
      targetName,
      isAlreadySuspended
    };
  });

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Reports & Moderation</h1>
        <p className="text-body font-supporting">Review and act upon user-submitted reports for listings and profiles.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-body">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">No reports to review!</p>
            <p className="text-sm">Your community is looking healthy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Reporter</th>
                  <th className="px-6 py-4 font-semibold text-heading">Target</th>
                  <th className="px-6 py-4 font-semibold text-heading">Reason & Details</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold text-heading whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-body whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-body">
                      <div className="font-medium text-heading">{report.reporterName}</div>
                      <div className="text-xs opacity-70">{report.reporterEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                          {report.target_type}
                        </span>
                        <Link 
                          href={report.target_type === 'listing' ? `/listings/${report.target_id}` : `/artisans/${report.target_id}`} 
                          className="font-medium text-heading hover:text-primary transition underline decoration-border underline-offset-2"
                        >
                          {report.targetName}
                        </Link>
                        {report.isAlreadySuspended && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-100 px-2 py-0.5 rounded-full self-start">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-heading mb-1 capitalize">
                        {report.reason}
                      </div>
                      <div className="text-body text-xs line-clamp-2 max-w-sm">
                        {report.details || <span className="italic opacity-50">No additional details provided.</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        report.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        report.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ReportActions 
                        reportId={report.id}
                        targetType={report.target_type as 'listing' | 'profile'}
                        targetId={report.target_id}
                        status={report.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
