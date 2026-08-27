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

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-canvas border-b border-border text-sm font-semibold text-body">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50 transition ${user.is_suspended ? 'opacity-50 bg-red-50' : ''}`}>
                <td className="p-4">
                  <div className="font-bold text-heading">{user.full_name || "Unknown"}</div>
                  <div className="text-xs text-body mt-0.5">{user.email || user.id}</div>
                  {user.business_name && <div className="text-xs font-semibold text-primary mt-1">{user.business_name}</div>}
                </td>
                <td className="p-4">
                  <span className="uppercase tracking-wider text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 flex flex-col gap-1 items-start">
                  {user.is_suspended && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">Suspended</span>
                  )}
                  {user.is_verified && user.role === 'artisan' && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">Verified Artisan</span>
                  )}
                  {!user.is_suspended && (!user.is_verified || user.role !== 'artisan') && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Active</span>
                  )}
                </td>
                <td className="p-4 text-sm text-body">
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </td>
                <td className="p-4">
                  <UserActions 
                    id={user.id} 
                    isSuspended={user.is_suspended} 
                    isVerified={user.is_verified} 
                    role={user.role} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
