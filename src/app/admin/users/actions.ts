"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleUserSuspension(id: string, isSuspended: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: !isSuspended })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update user suspension status" };
  }

  return { success: true };
}

export async function toggleUserVerification(id: string, isVerified: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("profiles")
    .update({ is_verified: !isVerified })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update user verification status" };
  }

  return { success: true };
}
