import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60; // Revalidate every minute

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.toLowerCase() || "";
  const { data: postsData } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  const posts = postsData ?? [];

  // Fallback to dummy data if database is completely empty (just for demo/initial purposes)
  let displayPosts = posts.length > 0 ? posts.map(p => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    date: new Date(p.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    category: p.category,
    image: p.image,
    slug: p.slug
  })) : [
    {
      id: "1",
      title: "How to Find the Perfect Room in Accra",
      excerpt: "Searching for a room in Accra can be daunting. Follow these simple tips to navigate the rental market like a pro.",
      date: "July 24, 2026",
      category: "Guides",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600",
      slug: "find-perfect-room"
    },
    {
      id: "2",
      title: "Top 5 Questions to Ask Your Landlord",
      excerpt: "Before signing any lease, make sure you ask your potential landlord these critical questions.",
      date: "July 18, 2026",
      category: "Tips",
      image: "https://images.unsplash.com/photo-1556910103-1c02745a872e?w=1600",
      slug: "questions-to-ask-landlord"
    }
  ];

  if (query) {
    displayPosts = displayPosts.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  }

  return (
    <main className="flex-1 w-full bg-canvas pb-20 -mt-28">
      {/* Premium Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 border-b border-border overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600" alt="Blog Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
            The DirectRent GH Blog
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-supporting drop-shadow-sm">
            News, tips, and insights on the Ghanaian real estate market, home maintenance, and more.
          </p>
          
          {/* Search Bar */}
          <form action="/blog" method="GET" className="max-w-2xl mx-auto mt-10 relative shadow-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-body/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
                type="text" 
                name="q"
                defaultValue={resolvedParams.q || ""}
                placeholder="Search articles (e.g. rent tips, Accra)" 
                className="w-full pl-12 pr-24 py-4 rounded-full border-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg text-heading placeholder:text-body/50"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-primary-hover transition">Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-heading">
            {query ? "Search Results" : "Latest Articles"}
          </h2>
          {query && (
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
              Clear search
            </Link>
          )}
        </div>
        
        {displayPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map((post, idx) => (
          <article key={idx} className="relative flex-shrink-0 block w-full group">
              <Link href={`/blog/${post.id}`} className="block">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                      <img src={post.image ?? ""} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
              </Link>
              <Link href={`/blog/${post.id}`} className="block mt-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-heading truncate">
                          {post.category}
                      </p>
                      <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-body flex-shrink-0">
                          {post.date}
                      </span>
                  </div>
                  <p className="text-base text-heading font-semibold line-clamp-2 leading-snug">
                      {post.title}
                  </p>
                  <p className="text-sm text-body/80 line-clamp-2 mt-1">
                      {post.excerpt}
                  </p>
              </Link>
          </article>
        ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-border">
                <p className="text-body font-medium">
                    {query ? `No articles found matching "${query}".` : "No articles available right now."}
                </p>
            </div>
        )}
      </section>
    </main>
  );
}
