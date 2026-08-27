"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HeartSaveButton } from "@/components/heart-save-button";

export type Artisan = {
    id: string;
    name: string;
    trade: string;
    area: string;
    bio: string;
    photoUrl: string | null;
    available: boolean;
    isBoosted: boolean;
    averageRating: number | null;
    reviewCount: number;
    isSaved?: boolean;
};

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
    return (
        <div className="relative flex-shrink-0 w-full group cursor-pointer">
            <Link href={`/artisans/${artisan.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mint">
                    {artisan.photoUrl ? (
                        <img
                            src={artisan.photoUrl}
                            alt={artisan.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-mint/40 text-5xl font-bold text-primary">
                            {artisan.name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-col gap-1 items-start">
                        {artisan.isBoosted && (
                            <span className="rounded-full bg-saffron px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-heading shadow backdrop-blur">
                                Featured
                            </span>
                        )}
                        {!artisan.available && (
                            <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow backdrop-blur">
                                Unavailable
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <HeartSaveButton targetId={artisan.id} saveType="profile" initialSaved={artisan.isSaved} isLoggedIn={true} />

            <Link href={`/artisans/${artisan.id}`} className="block mt-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-heading text-sm truncate">{artisan.name}</p>
                    {artisan.averageRating !== null && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-heading flex-shrink-0">
                            ★ {artisan.averageRating.toFixed(1)}
                        </span>
                    )}
                </div>

                <p className="mt-0.5 text-xs text-body/60 truncate">{artisan.trade} • {artisan.area}</p>

                <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="text-body/50">
                        {artisan.reviewCount > 0
                            ? `${artisan.reviewCount} review${artisan.reviewCount === 1 ? "" : "s"}`
                            : "No reviews yet"}
                    </span>
                    {artisan.available && (
                        <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-600">Available now</span>
                        </>
                    )}
                </div>
            </Link>
        </div>
    );
}

export function ArtisansPageClient({ artisans }: { artisans: Artisan[] }) {
    const [activeFilter, setActiveFilter] = useState("All");
    // const [query, setQuery] = useState("");

    const TRADES = useMemo(
        () => ["All", ...Array.from(new Set(artisans.map((a) => a.trade)))],
        [artisans]
    );

    const results = useMemo(() => {
        return artisans.filter((a) => {
            if (activeFilter !== "All" && a.trade !== activeFilter) return false;

            /*
            if (query) {
                const q = query.toLowerCase();
                if (!a.name.toLowerCase().includes(q) && !a.trade.toLowerCase().includes(q)) return false;
            }
            */
            return true;
        });
    }, [artisans, activeFilter]);

    return (
        <main className="min-h-screen bg-canvas py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">


                {/* Compact Filter */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {TRADES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveFilter(t)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${activeFilter === t
                                    ? "bg-primary text-white border-primary font-semibold"
                                    : "bg-card text-body border-border hover:border-primary/50 hover:text-heading"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Search and Advanced Filters are commented out 
                <div className="flex items-center gap-3 w-full sm:w-80 rounded-full border border-border bg-card px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                    <svg className="h-4 w-4 text-body/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or trade…"
                        className="flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-body/40"
                    />
                </div>
                */}

                {/* Results */}
                <div>
                    <p className="text-sm text-body/70 mb-5">
                        <span className="font-semibold text-heading">{results.length}</span>{" "}
                        artisan{results.length !== 1 ? "s" : ""} found
                    </p>

                    {results.length === 0 ? (
                        <div className="py-24 text-center rounded-3xl border border-border bg-card">
                            <p className="text-lg font-semibold text-heading">No artisans match your filters</p>
                            <p className="mt-1 text-sm text-body/60">Try adjusting your trade filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {results.map((artisan) => (
                                <ArtisanCard key={artisan.id} artisan={artisan} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}