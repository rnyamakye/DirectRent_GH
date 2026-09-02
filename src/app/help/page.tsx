import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Dynamic

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.toLowerCase() || "";
  const categoryFilter = resolvedParams.category?.toLowerCase() || "";

  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  let displayFaqs = faqs || [];
  
  if (query) {
    displayFaqs = displayFaqs.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  } else if (categoryFilter) {
    displayFaqs = displayFaqs.filter(faq => faq.category?.toLowerCase() === categoryFilter);
  }

  return (
    <main className="flex-1 w-full bg-canvas pb-20 -mt-28">
      {/* Premium Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 border-b border-border overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600" alt="Help Center Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
            How can we help you?
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-supporting drop-shadow-sm">
            Search our knowledge base or browse frequently asked questions below to find the answers you need.
          </p>
          
          {/* Search Bar */}
          <form action="/help" method="GET" className="max-w-2xl mx-auto mt-10 relative shadow-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-body/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
                type="text" 
                name="q"
                defaultValue={resolvedParams.q || ""}
                placeholder="Search for answers (e.g. How to list a property)" 
                className="w-full pl-12 pr-24 py-4 rounded-full border-none bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg text-heading placeholder:text-body/50"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-primary-hover transition">Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
          {/* Left Sidebar (Sticky) */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
                <h2 className="text-2xl font-bold text-heading mb-6">Support Resources</h2>
                
                <div className="space-y-6">
                    {/* Categories Filter */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <ul className="space-y-4 flex flex-col items-start">
                            <li>
                              <Link prefetch={false} 
                                href="/help" 
                                className={`transition-colors ${!categoryFilter ? 'text-primary font-bold hover:underline' : 'text-body font-medium hover:text-primary'}`}
                              >
                                All Questions
                              </Link>
                            </li>
                            <li>
                              <Link prefetch={false} 
                                href="/help?category=general" 
                                className={`transition-colors ${categoryFilter === 'general' ? 'text-primary font-bold hover:underline' : 'text-body font-medium hover:text-primary'}`}
                              >
                                General Questions
                              </Link>
                            </li>
                            <li>
                              <Link prefetch={false} 
                                href="/help?category=safety" 
                                className={`transition-colors ${categoryFilter === 'safety' ? 'text-primary font-bold hover:underline' : 'text-body font-medium hover:text-primary'}`}
                              >
                                Trust & Safety
                              </Link>
                            </li>
                            <li>
                              <Link prefetch={false} 
                                href="/help?category=renters" 
                                className={`transition-colors ${categoryFilter === 'renters' ? 'text-primary font-bold hover:underline' : 'text-body font-medium hover:text-primary'}`}
                              >
                                For Renters
                              </Link>
                            </li>
                            <li>
                              <Link prefetch={false} 
                                href="/help?category=agents" 
                                className={`transition-colors ${categoryFilter === 'agents' ? 'text-primary font-bold hover:underline' : 'text-body font-medium hover:text-primary'}`}
                              >
                                For Agents
                              </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-mint/30 rounded-2xl border border-primary/20 p-6 flex flex-col items-start gap-4">
                        <div className="p-3 bg-card rounded-xl shadow-sm text-primary">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-heading">Still need help?</h3>
                        <p className="text-body text-sm font-supporting leading-relaxed">
                            Can't find the answer you're looking for? Our dedicated support team is here to help you resolve any issues.
                        </p>
                        <Link prefetch={false} 
                            href="/contact" 
                            className="mt-2 w-full text-center bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition shadow-sm"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Content Area (FAQs) */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-heading capitalize">
                {query ? "Search Results" : categoryFilter ? `${categoryFilter} Questions` : "Frequently Asked Questions"}
              </h2>
              {(query || categoryFilter) && (
                <Link prefetch={false} href="/help" className="text-sm font-semibold text-primary hover:underline">
                  Clear filter
                </Link>
              )}
            </div>
            
            {displayFaqs.length > 0 ? (
                <div className="space-y-4">
                {displayFaqs.map((faq) => (
                    <details 
                        key={faq.id} 
                        className="group bg-card rounded-2xl border border-border overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                    >
                        <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-lg text-heading transition hover:bg-slate-50">
                            {faq.question}
                            <span className="relative ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-180">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </span>
                        </summary>
                        <div className="px-6 pb-6 pt-2 font-supporting text-body leading-relaxed whitespace-pre-wrap border-t border-border">
                            {faq.answer}
                        </div>
                    </details>
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                    <p className="text-body font-medium">
                        {query ? `No FAQs found matching "${query}".` : "No frequently asked questions available right now."}
                    </p>
                </div>
            )}
          </div>
          
        </div>
      </section>
    </main>
  );
}
