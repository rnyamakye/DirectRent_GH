import { NewsletterForm } from "@/components/admin/newsletter-form";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Admin - Newsletter | DirectRent GH",
};

export const revalidate = 0;

export default async function AdminNewsletterPage() {
  const supabase = await createClient();

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load subscribers: {error.message}</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Newsletter</h1>
        <p className="text-body font-supporting">Compose emails and manage your subscriber list.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div>
          <NewsletterForm />
        </div>

        {/* Right Column: Subscribers List */}
        <div className="bg-white border border-border/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-6 border-b border-border/60 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-heading">Subscribers</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {subscribers?.length || 0} Total
            </span>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 shadow-sm">
                <tr className="border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {subscribers?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm text-xs shrink-0">
                          {sub.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-heading truncate max-w-[200px]" title={sub.email}>
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-body/80 font-medium text-right">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {subscribers?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-body/60 text-sm">
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
