import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { createClient } from "@/lib/supabase/server";
import { ContactAgentButton } from "@/components/contact-agent-button";

export default async function AgentProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?returnTo=/agents/${id}`);
    }

    // 1. Fetch Agent Profile
    const { data: agent, error } = await supabase
        .from("profiles")
        .select("full_name, business_name, avatar_url, created_at, bio, location, languages, fun_fact, phone, email, is_verified")
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
        reviewerName: (r.profiles as any)?.full_name ?? "Anonymous",
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
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start mt-6">
                {/* Left Column: Airbnb Style Host Card */}
                <div className="lg:col-span-1 top-28">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-mint flex items-center justify-center text-4xl text-primary font-bold">
                                {agent.avatar_url ? (
                                    <Image
                                        src={agent.avatar_url}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#E61E4D] text-white p-2 rounded-full border-2 border-white" title="Identity Verified">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold text-heading mt-5">{displayName}</h1>
                        <div className="flex items-center gap-1 font-bold text-sm text-heading mt-1 mb-2">
                            🏆 <span className="uppercase tracking-widest text-[#E61E4D]">Superagent</span>
                        </div>

                        <ContactAgentButton agentId={id} phone={agent.phone} email={agent.email} />

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
                                <span className="font-extrabold text-heading text-lg">{listings.length}</span>
                                <span className="text-xs text-body uppercase tracking-wider font-semibold mt-1">Listings</span>
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
                                        className="group flex flex-col gap-3 cursor-pointer"
                                    >
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-slate-100 flex items-center justify-center text-slate-300">
                                            {listing.photo_urls && listing.photo_urls.length > 0 ? (
                                                <Image
                                                    src={listing.photo_urls[0]}
                                                    alt={listing.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-semibold text-heading truncate">{listing.title}</p>
                                            <p className="text-sm text-body mt-0.5">{listing.landmark}</p>
                                            <p className="font-semibold text-heading mt-1">
                                                GHS {listing.price.toLocaleString()}
                                                <span className="font-normal text-body"> / mo</span>
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
