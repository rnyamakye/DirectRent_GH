"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

export async function deleteReview(id: string) {
  const supabase = await createClient();
  
  // Fetch review before deletion to notify the author
  const { data: review } = await supabase
    .from("reviews")
    .select("reviewer_id")
    .eq("id", id)
    .single();
  
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Failed to delete review" };
  }
  
  if (review?.reviewer_id) {
    await sendNotification({
      userId: review.reviewer_id,
      type: "account_updates",
      title: "Review Removed",
      message: "A review you posted has been removed by a moderator for violating our community guidelines.",
    });
  }

  return { success: true };
}
