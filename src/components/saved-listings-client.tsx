"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ListingCard } from "@/components/listing-card";
import { AgentCard, type Agent } from "@/components/agents-page-client";
import { ArtisanCard, type Artisan } from "@/components/artisans-page-client";
import { ListingsIcon, AgentsIcon, ArtisansIcon } from "@/components/icons";

export function SavedListingsClient({ 
    initialSavedListings,
    initialSavedAgents,
    initialSavedArtisans
}: { 
    initialSavedListings: any[];
    initialSavedAgents: Agent[];
    initialSavedArtisans: Artisan[];
}) {
    const [savedListings, setSavedListings] = useState(initialSavedListings);
    const [activeTab, setActiveTab] = useState<"listings" | "agents" | "artisans">("listings");

    async function handleUnsaveListing(id: string) {
        setSavedListings((current) => current.filter((item) => item.id !== id));
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("saved_listings").delete().eq("renter_id", user.id).eq("listing_id", id);
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-heading">Saved</h1>
                <p className="text-base text-body/80">Properties and professionals you've bookmarked.</p>
            </div>

            <div className="flex gap-4 border-b border-border pb-2">
                <button 
                    onClick={() => setActiveTab("listings")}
                    className={`flex items-center gap-2 font-semibold pb-2 border-b-2 transition-colors ${activeTab === "listings" ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"}`}
                >
                    <ListingsIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Listings ({savedListings.length})</span>
                </button>
                <button 
                    onClick={() => setActiveTab("agents")}
                    className={`flex items-center gap-2 font-semibold pb-2 border-b-2 transition-colors ${activeTab === "agents" ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"}`}
                >
                    <AgentsIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Agents ({initialSavedAgents.length})</span>
                </button>
                <button 
                    onClick={() => setActiveTab("artisans")}
                    className={`flex items-center gap-2 font-semibold pb-2 border-b-2 transition-colors ${activeTab === "artisans" ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"}`}
                >
                    <ArtisansIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Artisans ({initialSavedArtisans.length})</span>
                </button>
            </div>

            {activeTab === "listings" && (
                savedListings.length === 0 ? (
                    <EmptyState type="listings" href="/listings" />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {savedListings.map((listing) => (
                            <div key={listing.id} className="relative group">
                                <Link prefetch={false} href={`/listings/${listing.id}`} className="block">
                                    <ListingCard 
                                        listing={{
                                            ...listing,
                                            location: listing.city,
                                            area: listing.landmark || "Ghana",
                                            beds: listing.bedrooms,
                                            baths: listing.bathrooms,
                                            image: listing.photoUrl,
                                        }} 
                                        initialSaved={true} 
                                        isLoggedIn={true} 
                                        hideSaveButton={true}
                                    />
                                </Link>
                                <button
                                    onClick={() => handleUnsaveListing(listing.id)}
                                    className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center bg-white border border-border rounded-full text-body hover:text-red-500 hover:border-red-500 shadow-sm transition-colors"
                                    aria-label="Remove from saved"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === "agents" && (
                initialSavedAgents.length === 0 ? (
                    <EmptyState type="agents" href="/agents" />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {initialSavedAgents.map((agent) => (
                            <div key={agent.id} className="relative group">
                                <AgentCard agent={agent} />
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === "artisans" && (
                initialSavedArtisans.length === 0 ? (
                    <EmptyState type="artisans" href="/artisans" />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {initialSavedArtisans.map((artisan) => (
                            <div key={artisan.id} className="relative group">
                                <ArtisanCard artisan={artisan} />
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

function EmptyState({ type, href }: { type: string, href: string }) {
    return (
        <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-semibold text-heading">You haven't saved any {type} yet.</p>
            <p className="text-body/70 max-w-sm text-sm">
                Keep track of {type} you love by saving them while browsing.
            </p>
            <Link prefetch={false}
                href={href}
                className="mt-2 inline-flex bg-heading hover:bg-black text-white rounded-full px-6 py-2.5 text-sm font-bold transition"
            >
                Browse {type}
            </Link>
        </div>
    );
}