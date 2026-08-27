"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteListing(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Failed to delete listing" };
  }

  return { success: true };
}
