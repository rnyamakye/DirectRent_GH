"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteReview(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Failed to delete review" };
  }

  return { success: true };
}
