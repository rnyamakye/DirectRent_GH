"use server";

import { createClient } from "@/lib/supabase/server";

export async function addFaq(formData: FormData) {
  const supabase = await createClient();
  
  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const category = formData.get("category") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  if (!question || !answer) {
    return { error: "Question and answer are required" };
  }

  const { error } = await supabase
    .from("faqs")
    .insert([{ question, answer, category, sort_order }]);

  if (error) {
    console.error("Failed to add FAQ:", error);
    return { error: "Failed to add FAQ" };
  }

  return { success: true };
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("faqs")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Failed to delete FAQ" };
  }

  return { success: true };
}
