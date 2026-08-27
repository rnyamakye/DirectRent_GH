"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addFaq, deleteFaq } from "./actions";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

export default function FaqClient({ faqs }: { faqs: FAQ[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddFaq = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addFaq(formData);
      if (res.error) throw new Error(res.error);
      
      toast.success("FAQ added successfully");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    
    setLoading(true);
    try {
      const res = await deleteFaq(id);
      if (res.error) throw new Error(res.error);
      
      toast.success("FAQ deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
        <h2 className="text-xl font-bold text-heading mb-4">Add New FAQ</h2>
        <form onSubmit={handleAddFaq} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Question</label>
            <input name="question" required className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60" placeholder="e.g. How do I contact an artisan?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Answer</label>
            <textarea name="answer" required rows={4} className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60" placeholder="Detailed answer..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-heading">Category</label>
              <input name="category" defaultValue="general" className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-heading">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={0} className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-heading outline-none focus:border-primary/60" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">
            {loading ? "Saving..." : "Save FAQ"}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-heading">Existing FAQs</h2>
        {faqs.length === 0 ? (
          <div className="p-6 text-center text-body border border-border rounded-xl">No FAQs found.</div>
        ) : (
          faqs.map(faq => (
            <div key={faq.id} className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-heading">{faq.question}</h3>
                <button onClick={() => handleDelete(faq.id)} disabled={loading} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                  Delete
                </button>
              </div>
              <p className="text-sm text-body whitespace-pre-wrap">{faq.answer}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">Order: {faq.sort_order}</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">Cat: {faq.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
