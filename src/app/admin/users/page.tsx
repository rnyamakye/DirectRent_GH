import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import UserActions from "./user-actions";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load users: {error.message}</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">User Moderation</h1>
        <p className="text-body font-supporting">Manage platform users, verify artisans, and enforce platform rules.</p>
      </div>

      <div className="bg-white border border-border/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border/80 text-xs font-bold uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users?.map((user) => {
              const initials = user.full_name 
                ? user.full_name.substring(0, 2).toUpperCase() 
                : (user.email ? user.email.substring(0, 2).toUpperCase() : "U");

              return (
                <tr key={user.id} className={`group hover:bg-slate-50/50 transition-colors ${user.is_suspended ? 'opacity-60 bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-heading group-hover:text-primary transition-colors">{user.full_name || "Unknown"}</span>
                        <span className="text-xs text-body mt-0.5">{user.email || user.id}</span>
                        {user.business_name && <span className="text-[10px] font-bold uppercase tracking-wider text-primary mt-1">{user.business_name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {user.is_suspended && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                          Suspended
                        </span>
                      )}
                      {user.is_verified && user.role === 'artisan' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Verified Artisan
                        </span>
                      )}
                      {!user.is_suspended && (!user.is_verified || user.role !== 'artisan') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-body/80 font-medium">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <UserActions 
                        id={user.id} 
                        isSuspended={user.is_suspended} 
                        isVerified={user.is_verified} 
                        role={user.role} 
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
