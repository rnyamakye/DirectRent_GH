"use server";

import { createClient } from "@/lib/supabase/server";

export async function resolveSupportTicket(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("support_messages")
    .update({ 
      status: "resolved", 
      resolved_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) {
    console.error("Error resolving ticket:", error);
    return { error: "Failed to resolve ticket" };
  }

  return { success: true };
}
