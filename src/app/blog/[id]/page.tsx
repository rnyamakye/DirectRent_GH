import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let post = null;
  let error = null;

  if (isUUID) {
    const res = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    post = res.data;
    error = res.error;
  } else if (["1", "2", "3"].includes(id)) {
    // Fallback for mock IDs if they were clicked before the page refreshed
    const slugs = [
      "how-to-find-the-perfect-room-in-accra",
      "top-5-questions-to-ask-your-landlord",
      "the-importance-of-using-verified-artisans"
    ];
    const slug = slugs[parseInt(id) - 1];
    const res = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single();
    post = res.data;
    error = res.error;
  }

  if (error || !post) {
    console.error("Blog post fetch error:", error, "id:", id);
    notFound();
  }

  const { data: relatedPosts } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, category, published_at, image")
    .neq("id", post.id)
    .limit(3);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "Unknown Date";

  return (
    <main className="min-h-screen bg-canvas pb-20 -mt-28">
      {/* Hero Image */}
      <div className="w-full h-[45vh] md:h-[55vh] relative bg-slate-200">
        <img src={post.image ?? ""} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/40" />

        {/* Back Link overlaid on Hero */}
        <div className="absolute top-[200px] md:top-[300px] left-0 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-sm font-bold text-white transition-colors hover:text-white/80 drop-shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
        <div className="bg-card rounded-3xl p-6 sm:p-12 shadow-xl border border-border">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider">{post.category}</span>
            <span className="text-sm font-medium text-body/70">{formattedDate}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-heading leading-tight mb-8">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-primary overflow-hidden border border-border">
              {post.author_name ? post.author_name.charAt(0) : "A"}
            </div>
            <div>
              <p className="font-bold text-heading">{post.author_name ?? "Author"}</p>
              <p className="text-sm text-body/80">{post.author_role ?? "Contributor"}</p>
            </div>
          </div>

          {/* Body */}
          <div
            className="text-lg text-body leading-relaxed space-y-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-heading [&>h2]:mt-10 [&>p]:text-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Related Blogs Section */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-heading mb-8">Related Articles</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((relatedPost, idx) => {
                const relatedDate = relatedPost.published_at
                  ? new Date(relatedPost.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : "Unknown Date";
                return (
                  <article key={idx} className="relative flex-shrink-0 block w-full group">
                    <Link href={`/blog/${relatedPost.id}`} className="block">
                      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                        <img src={relatedPost.image ?? ""} alt={relatedPost.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    </Link>
                    <Link href={`/blog/${relatedPost.id}`} className="block mt-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-heading truncate">
                          {relatedPost.category}
                        </p>
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-body flex-shrink-0">
                          {relatedDate}
                        </span>
                      </div>
                      <p className="text-base text-heading font-semibold line-clamp-2 leading-snug">
                        {relatedPost.title}
                      </p>
                      <p className="text-sm text-body/80 line-clamp-2 mt-1">
                        {relatedPost.excerpt}
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
