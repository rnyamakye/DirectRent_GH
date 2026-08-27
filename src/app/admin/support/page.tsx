import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import ResolveButton from "./resolve-button";

export const revalidate = 0; // dynamic page

export default async function AdminSupportPage() {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 sm:p-10 text-red-500">
        Failed to load support messages: {error.message}
      </div>
    );
  }

  const pendingCount = messages?.filter(m => m.status === 'pending').length || 0;

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Support Tickets</h1>
        <p className="text-body font-supporting">Manage and respond to user inquiries.</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="px-4 py-2 rounded-lg bg-orange-50 text-orange-700 font-semibold text-sm border border-orange-100">
          {pendingCount} Pending Tickets
        </div>
        <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100">
          {messages.length - pendingCount} Resolved Tickets
        </div>
      </div>

      <div className="grid gap-4">
        {messages?.length === 0 ? (
          <div className="p-8 text-center text-body bg-card rounded-2xl border border-border shadow-sm">
            No support messages yet!
          </div>
        ) : (
          messages?.map((msg) => (
            <div key={msg.id} className={`p-6 rounded-2xl border flex flex-col gap-3 shadow-sm ${msg.status === 'pending' ? 'bg-card border-border/80' : 'bg-canvas border-border/40 opacity-70'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-heading text-lg">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-primary hover:underline text-sm font-medium">
                    {msg.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-body/60 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                  {msg.status === 'pending' ? (
                    <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">Pending</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">Resolved</span>
                  )}
                </div>
              </div>
              <p className="text-body font-supporting mt-2 whitespace-pre-wrap">{msg.message}</p>
              
              {msg.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end gap-3">
                  <a href={`mailto:${msg.email}`} className="px-4 py-2 rounded-xl border border-border text-sm font-bold text-heading hover:bg-slate-50 transition">
                    Reply via Email
                  </a>
                  <ResolveButton id={msg.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
