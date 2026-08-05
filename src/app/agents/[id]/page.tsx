import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createClient } from "@/lib/supabase/server";

export default async function AgentProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Agent Profile
    const { data: agent, error } = await supabase
        .from("profiles")
        .select("full_name, business_name, avatar_url, created_at, bio, location, languages, fun_fact")
        .eq("id", id)
        .eq("role", "agent")
        .single();

    if (error || !agent) {
        notFound();
    }

    if (user?.id !== id) {
        // Record profile view
        await supabase.from("profile_views").insert({
            target_id: id,
            viewer_id: user?.id ?? null,
        });
    }

    // 2. Fetch Active Listings
    const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("agent_id", id)
        .eq("status", "available")
        .order("created_at", { ascending: false });

    const listings = listingsData ?? [];

    // 3. Fetch Reviews
    const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, rating, comment, reviewer_id, created_at, profiles!reviews_reviewer_id_fkey(full_name)")
        .eq("target_type", "agent")
        .eq("target_id", id)
        .order("created_at", { ascending: false });

    const reviews = (reviewsData ?? []).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewer_id: r.reviewer_id,
        reviewerName: r.profiles?.full_name ?? "Anonymous",
        created_at: r.created_at,
    }));

    // Computed Properties
    const displayName = id === user?.id ? "You" : (agent.business_name ?? agent.full_name ?? "Agent");
    const averageRating =
        reviews.length === 0
            ? null
            : reviews.reduce((total, r) => total + r.rating, 0) / reviews.length;

    // Diff in months between now and created_at
    const createdDate = new Date(agent.created_at);
    const now = new Date();
    const monthsHosting =
        (now.getFullYear() - createdDate.getFullYear()) * 12 +
        (now.getMonth() - createdDate.getMonth());

    const initials = displayName.charAt(0).toUpperCase();

    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[80vh]">
            <Breadcrumbs items={[
                { label: "Home", href: "/" },
                { label: "Agents", href: "/agents" },
                { label: displayName },
            ]} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start mt-6">
                {/* Left Column: Airbnb Style Host Card */}
                <div className="lg:col-span-1 sticky top-28">
                    <div className="bg-white rounded-3xl p-8 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-border/50 flex flex-col items-center text-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-mint flex items-center justify-center text-4xl text-primary font-bold">
                                    <img
                                        src={agent.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                    />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#E61E4D] text-white p-2 rounded-full border-2 border-white" title="Identity Verified">
                                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M13.102 2.537l.092-.007a1 1 0 01.764.298l.067.08c.187.242.234.56.126.853l-.053.116-2.5 5a1 1 0 01-1.62.19l-.076-.08-2.5-3a1 1 0 011.41-1.4l.08.086 1.637 1.964 1.83-3.66a1 1 0 01.743-.44z"></path></svg>
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold text-heading mt-5">{displayName}</h1>
                        <div className="flex items-center gap-1 font-bold text-sm text-heading mt-1 mb-6">
                            🏆 <span className="uppercase tracking-widest text-[#E61E4D]">Superagent</span>
                        </div>

                        <div className="flex w-full divide-x divide-border border-t border-border pt-6">
                            <div className="flex-1 flex flex-col items-center">
                                <span className="font-extrabold text-heading text-lg">{reviews.length}</span>
                                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Reviews</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                                <span className="font-extrabold text-heading text-lg flex items-center gap-1">
                                    {averageRating ? averageRating.toFixed(1) : "New"} <span className="text-sm">★</span>
                                </span>
                                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Rating</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                                <span className="font-extrabold text-heading text-lg">{Math.max(1, monthsHosting)}</span>
                                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Months</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-12 pt-6">
                    {/* About Section */}
                    <div>
                        <h2 className="text-3xl font-bold text-heading mb-6">About {displayName}</h2>
                        <div className="flex flex-col gap-4 text-heading">
                            <div className="flex items-center gap-3">
                                <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none stroke-current" style={{ strokeWidth: 2 }}><path d="M16 2a14 14 0 100 28 14 14 0 000-28zm0 0v28M8.5 16h15M16 2c-3.8 4-6 9.3-6 14s2.2 10 6 14c3.8-4 6-9.3 6-14s-2.2-10-6-14z"></path></svg>
                                <span>Speaks <strong>{agent.languages || "English"}</strong></span>
                            </div>
                            {agent.location && (
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📍</span>
                                    <span>Based in <strong>{agent.location}</strong></span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none stroke-current" style={{ strokeWidth: 2 }}><path d="M16 2a14 14 0 100 28 14 14 0 000-28zm9.9 8.5L13.5 23l-5.4-5.4"></path></svg>
                                <span><strong>Identity verified</strong></span>
                            </div>
                            {agent.fun_fact && (
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚡</span>
                                    <span>Fun fact: <strong>{agent.fun_fact}</strong></span>
                                </div>
                            )}
                        </div>
                        <p className="text-body mt-6 leading-relaxed max-w-2xl whitespace-pre-wrap">
                            {agent.bio || `Hi, I am ${displayName}. I pride myself on providing exceptional service to all my renters. Let me help you find your next home in Ghana!`}
                        </p>
                    </div>

                    <hr className="border-border" />

                    {/* Reviews Section */}
                    {reviews.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-heading mb-8">
                                What guests are saying about {displayName}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {reviews.slice(0, 4).map((review) => (
                                    <div key={review.id} className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-heading text-lg">
                                                {review.reviewerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-heading">{review.reviewerName}</span>
                                                <span className="text-sm text-body">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-[10px] text-heading">
                                                {"★".repeat(review.rating)}
                                            </div>
                                            <span className="text-body text-xs">•</span>
                                            <span className="text-xs text-body">DirectRent</span>
                                        </div>
                                        <p className="text-heading text-base leading-relaxed line-clamp-3">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {reviews.length > 4 && (
                                <button className="mt-8 px-6 py-3 border border-heading rounded-lg font-semibold text-heading hover:bg-slate-50 transition">
                                    Show all {reviews.length} reviews
                                </button>
                            )}
                        </div>
                    )}
                    {reviews.length > 0 && <hr className="border-border" />}

                    {/* Listings Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-heading mb-8">
                            {displayName}&apos;s listings
                        </h2>
                        {listings.length === 0 ? (
                            <p className="font-supporting text-sm text-body">
                                No active listings right now.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {listings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        href={`/listings/${listing.id}`}
                                        className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all"
                                    >
                                        <div className="aspect-[4/3] bg-mint overflow-hidden relative">
                                            <img
                                                src={listing.photo_urls && listing.photo_urls.length > 0 ? listing.photo_urls[0] : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600"}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <p className="font-semibold text-heading truncate">{listing.title}</p>
                                            <p className="text-sm text-body mt-0.5">{listing.landmark}</p>
                                            <p className="font-semibold text-primary mt-2">
                                                GHS {listing.price.toLocaleString()}
                                                <span className="font-normal text-body text-sm"> / mo</span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
