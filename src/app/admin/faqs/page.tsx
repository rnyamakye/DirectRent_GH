import { createClient } from "@/lib/supabase/server";
import FaqClient from "./faq-client";

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const supabase = await createClient();

  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load FAQs: {error.message}</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-2">Help Center CMS</h1>
        <p className="text-body font-supporting">Add, edit, and order Frequently Asked Questions for the public Help page.</p>
      </div>

      <FaqClient faqs={faqs || []} />
    </div>
  );
}
