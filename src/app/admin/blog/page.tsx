"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Guides");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("blog_posts").insert({
      title,
      category,
      excerpt,
      content,
      slug,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTitle("");
      setExcerpt("");
      setContent("");
      setTimeout(() => router.push("/blog"), 1500);
    }
  }

  return (
    <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-heading mb-8">Create Blog Post</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-semibold border border-emerald-200">
            Blog post published successfully! Redirecting...
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-heading">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. How to Find the Perfect Room"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-heading">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option>Guides</option>
            <option>Tips</option>
            <option>Maintenance</option>
            <option>News</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-heading">Excerpt</label>
          <textarea
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            placeholder="A short summary of the post..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-heading">Content (Markdown)</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Write the full post here..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 font-bold text-sm transition disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </main>
  );
}
