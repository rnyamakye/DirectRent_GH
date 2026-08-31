"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuardLink } from "@/components/auth-guard-link";

type Listing = {
    id: string;
    title: string;
    city: string;
    landmark: string;
    propertyType: string;
    bedrooms: number | null;
    bathrooms: number | null;
    price: number;
    photoUrl: string | null;
    rating: number | null;
    reviewCount: number;
    isNew: boolean;
};

type FilterGroup = "city" | "type";

// const FILTER_GROUPS: { id: FilterGroup; label: string }[] = [
//     { id: "city", label: "City" },
//     { id: "type", label: "Type" },
// ];

function ListingCard({ listing }: { listing: Listing }) {
    return (
        <AuthGuardLink
            href={`/listings/${listing.id}`}
            className="group block rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-200"
        >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                {listing.photoUrl ? (
                    <img
                        src={listing.photoUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                )}
                {listing.isNew && (
                    <span className="absolute left-3 top-3 rounded-full bg-saffron px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-heading shadow">
                        New
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-heading truncate">{listing.title}</p>
                    {listing.rating !== null && (
                        <span className="flex items-center gap-1 text-sm font-semibold text-heading flex-shrink-0">
                            ★ {listing.rating.toFixed(1)}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs text-body/70 truncate">
                    {listing.city} · {listing.landmark}
                </p>
                <p className="mt-2 text-xs text-body/70">
                    {listing.bedrooms ? `${listing.bedrooms} bed` : ""}
                    {listing.bathrooms ? ` · ${listing.bathrooms} bath` : ""}
                </p>
                <p className="mt-2 font-semibold text-primary">
                    GHS {listing.price.toLocaleString()}
                    <span className="font-normal text-body text-sm"> / mo</span>
                </p>
            </div>
        </AuthGuardLink>
    );
}

export function HomeListingsSection({ listings }: { listings: Listing[] }) {
    const [activeGroup, setActiveGroup] = useState<FilterGroup>("city");
    const [cityFilter, setCityFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const cities = ["All", ...Array.from(new Set(listings.map((l) => l.city)))];
    const types = ["All", ...Array.from(new Set(listings.map((l) => l.propertyType)))];
    const currentOptions = activeGroup === "city" ? cities : types;
    const currentValue = activeGroup === "city" ? cityFilter : typeFilter;
    const setCurrentValue = activeGroup === "city" ? setCityFilter : setTypeFilter;

    const filtered = listings.filter((l) => {
        return (
            (cityFilter === "All" || l.city === cityFilter) &&
            (typeFilter === "All" || l.propertyType === typeFilter)
        );
    });

    return (
        <>
            {/* <div className="flex gap-1 mb-4">
                {FILTER_GROUPS.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setActiveGroup(g.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${activeGroup === g.id
                            ? "bg-heading text-white border-heading"
                            : "bg-card text-body border-border hover:border-primary/40 hover:text-heading"
                            }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div> */}

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
                {currentOptions.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setCurrentValue(opt)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm border transition ${currentValue === opt
                            ? "bg-primary text-white border-primary font-semibold"
                            : "bg-card text-body border-border hover:border-primary/50 hover:text-heading"
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="py-20 text-center text-body/60">
                    <p className="text-lg font-semibold text-heading">No listings match your filter</p>
                    <p className="mt-1 text-sm">Try selecting &quot;All&quot; above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}

            <div className="mt-12 text-center">
                <Link prefetch={false}
                    href="/listings"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-heading shadow-sm transition hover:border-primary hover:text-primary hover:shadow-md"
                >
                    View all listings
                </Link>
            </div>
        </>
    );
}