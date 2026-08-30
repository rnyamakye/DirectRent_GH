import Link from "next/link";
type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  published_at: string;
  image: string;
};

export function MarketingHome({ stats = { users: 0, listings: 0, artisans: 0 }, blogs = [] }: { stats?: { users: number, listings: number, artisans: number }, blogs?: BlogPost[] }) {
    return (
        <div>
            <main className="min-h-screen bg-canvas text-body">
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden -top-25">
                    <div className="absolute inset-0">
                        <img
                            alt="Modern home exterior"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600"
                        />
                        <div className="absolute inset-0 bg-slate-950/45" />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-canvas to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl px-4 pt-[200px] pb-16 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center text-white">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-mint/90">
                                Discover homes and trusted professionals
                            </p>
                            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm md:text-6xl lg:text-7xl text-white">
                                Find Your Favorite Property
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 md:text-lg">
                                Browse rooms, apartments, and local artisans in one place. DirectRent GH
                                helps you rent faster, list smarter, and get expert help when you need it.
                            </p>
                        </div>

                        <div className="mx-auto mt-10 flex justify-center gap-4">
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-primary-hover shadow-xl"
                            >
                                Sign Up
                            </Link>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-gray-50 shadow-xl"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>

                {/* <section id="properties" className="bg-canvas py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Fresh inventory</p>
                            <h2 className="mt-2 text-3xl font-bold text-heading md:text-4xl">Latest Listings</h2>
                            <p className="mt-2 text-body/70 text-sm">
                                Browse recent homes across Ghana — filter by where, what, and how big.
                            </p>
                        </div>
                        <HomeListingsSection listings={listings} />
                    </div>
                </section> */}

                <section id="about" className="bg-slate-100 py-20">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">How it works</p>
                        <h2 className="mt-4 text-3xl font-bold text-heading md:text-4xl">
                            Everything you need in three clear steps
                        </h2>
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {[
                                ["Search", "Filter homes, artisans, and listings by area, type, and budget."],
                                ["Connect", "Message agents or book an artisan directly from their profile."],
                                ["Move forward", "Save listings, leave reviews, and track your shortlist."],
                            ].map(([title, description], index) => (
                                <div key={title} className="rounded-3xl border border-border bg-white p-6 text-left shadow-sm">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-primary font-bold">
                                        0{index + 1}
                                    </div>
                                    <h3 className="text-lg font-bold text-heading">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-body/80">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="bg-white py-20 border-y border-border">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-2 items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">About Us</p>
                            <h2 className="mt-4 text-3xl font-bold text-heading md:text-4xl">
                                Redefining the real estate experience in Ghana
                            </h2>
                            <p className="mt-6 text-lg text-body leading-relaxed font-supporting">
                                DirectRent GH is Ghana's premier platform for connecting renters with verified landlords, dedicated agents, and highly skilled artisans. We streamline the entire property lifecycle—from finding the perfect home to ensuring it's beautifully maintained.
                            </p>
                            <div className="mt-8">
                                <Link
                                    href="/about"
                                    className="group inline-flex items-center text-sm font-bold text-primary transition-colors hover:text-primary/80"
                                >
                                    View in detail
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-canvas border border-border text-center">
                                <div className="text-3xl font-black text-primary mb-1">{stats.users.toLocaleString()}</div>
                                <div className="text-sm font-semibold text-heading">Active Users</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-canvas border border-border text-center">
                                <div className="text-3xl font-black text-primary mb-1">{stats.listings.toLocaleString()}</div>
                                <div className="text-sm font-semibold text-heading">Verified Properties</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-canvas border border-border text-center col-span-2">
                                <div className="text-3xl font-black text-primary mb-1">{stats.artisans.toLocaleString()}</div>
                                <div className="text-sm font-semibold text-heading">Trusted Artisans</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Help Section */}
                <section className="bg-slate-50 py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Support</p>
                        <h2 className="mt-4 text-3xl font-bold text-heading md:text-4xl">
                            Need assistance?
                        </h2>
                        <p className="mt-4 text-lg text-body max-w-2xl mx-auto font-supporting">
                            Find answers to common questions about finding listings, verifying agents, and booking artisans.
                        </p>
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-10 text-left max-w-4xl mx-auto">
                            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-heading mb-2">How do I find a listing?</h3>
                                <p className="font-supporting text-sm text-body leading-relaxed">You can browse all available listings on the Listings page. Use the filters to narrow down by price, bedrooms, and property type to find your perfect match.</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-heading mb-2">Are the agents verified?</h3>
                                <p className="font-supporting text-sm text-body leading-relaxed">We strive to vet agents on our platform. Always remember to view the property in person before making any payments or deposits.</p>
                            </div>
                        </div>
                        <div className="mt-10">
                            <Link
                                href="/help"
                                className="group inline-flex items-center text-sm font-bold text-primary transition-colors hover:text-primary/80"
                            >
                                View in detail
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Blog Section */}
                <section className="bg-white py-20 border-t border-border">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Resources</p>
                                <h2 className="mt-4 text-3xl font-bold text-heading md:text-4xl">
                                    Latest from the Blog
                                </h2>
                            </div>
                            <Link
                                href="/blog"
                                className="group inline-flex items-center text-sm font-bold text-primary transition-colors hover:text-primary/80 whitespace-nowrap"
                            >
                                View in detail
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {blogs.map((post, idx) => {
                                const formattedDate = post.published_at 
                                    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : "Unknown Date";
                                return (
                                <article key={idx} className="relative flex-shrink-0 block w-full group">
                                    <Link href={`/blog/${post.id}`} className="block">
                                        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                                            <img src={post.image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    </Link>
                                    <Link href={`/blog/${post.id}`} className="block mt-3">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-xs font-semibold text-heading truncate">
                                                {post.category}
                                            </p>
                                            <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-medium text-body flex-shrink-0">
                                                {formattedDate}
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
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="bg-primary py-20 text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-mint/90">
                                    Contact Us
                                </p>
                                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                                    Have a question or need assistance? We're here to help.
                                </h2>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-8">
                                    <div>
                                        <h3 className="font-semibold text-mint">Email Support</h3>
                                        <a href="mailto:support@directrent.gh" className="text-white hover:underline">support@directrent.gh</a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                                <Link
                                    className="group inline-flex items-center text-sm font-bold text-white transition-colors hover:text-mint whitespace-nowrap"
                                    href="/contact"
                                >
                                    View in detail
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}