import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every minute

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: postsData } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  const posts = postsData ?? [];

  // Fallback to dummy data if database is completely empty (just for demo/initial purposes)
  const displayPosts = posts.length > 0 ? posts.map(p => ({
    title: p.title,
    excerpt: p.excerpt,
    date: new Date(p.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    category: p.category,
    slug: p.slug
  })) : [
    {
      title: "How to Find the Perfect Room in Accra",
      excerpt: "Searching for a room in Accra can be daunting. Follow these simple tips to navigate the rental market like a pro.",
      date: "July 24, 2026",
      category: "Guides",
      slug: "find-perfect-room"
    },
    {
      title: "Top 5 Questions to Ask Your Landlord",
      excerpt: "Before signing any lease, make sure you ask your potential landlord these critical questions.",
      date: "July 18, 2026",
      category: "Tips",
      slug: "questions-to-ask-landlord"
    }
  ];

  return (
    <main className="flex-1 px-6 py-16 max-w-4xl mx-auto w-full flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-heading mb-4">The DirectRent GH Blog</h1>
        <p className="font-supporting text-base text-body max-w-2xl mx-auto">
          News, tips, and insights on the Ghanaian real estate market, home maintenance, and more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map((post, idx) => (
          <article key={idx} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-mint/50 px-2.5 py-1 text-xs font-semibold text-primary">{post.category}</span>
              <span className="text-xs text-body/70">{post.date}</span>
            </div>
            <h2 className="text-lg font-bold text-heading leading-snug">{post.title}</h2>
            <p className="font-supporting text-sm text-body line-clamp-3">{post.excerpt}</p>
            <div className="mt-auto pt-4">
              <span className="text-sm font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1 cursor-pointer">
                Read more
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
