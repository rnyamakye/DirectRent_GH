import Link from "next/link";
export function MarketingHome() {
    return (
        <div>
            <main className="min-h-screen bg-canvas text-body">
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-25">
                    <div className="absolute inset-0">
                        <img
                            alt="Modern home exterior"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600"
                        />
                        <div className="absolute inset-0 bg-slate-950/45" />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-canvas to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-6xl px-4 pt-[200px] pb-16 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center text-white">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-mint/90">
                                Discover homes and trusted professionals
                            </p>
                            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm md:text-6xl text-white bg-white/20 rounded-full">
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
                    <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
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

                <section id="contact" className="bg-primary py-20 text-white">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-mint/90">
                                    Ready to join DirectRent GH?
                                </p>
                                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                                    Whether you need a place or want to list one, there is a place for you.
                                </h2>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                                <Link
                                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-mint"
                                    href="/auth/register"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}