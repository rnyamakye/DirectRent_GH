"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HeartSaveButton } from "@/components/heart-save-button";

export type Agent = {
    id: string;
    fullName: string | null;
    businessName: string | null;
    avatarUrl: string | null;
    averageRating: number | null;
    reviewCount: number;
    activeListingsCount: number;
    memberSince: string;
    isSaved?: boolean;
};

export function AgentCard({ agent }: { agent: Agent }) {
    const displayName = agent.businessName || agent.fullName || "Agent";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative flex-shrink-0 w-full group cursor-pointer">
            <Link prefetch={false} href={`/agents/${agent.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mint flex items-center justify-center">
                    {agent.avatarUrl ? (
                        <img
                            src={agent.avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-mint/40 text-5xl font-bold text-primary">
                            {initial}
                        </div>
                    )}

                    {agent.activeListingsCount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 shadow-sm border border-emerald-200 backdrop-blur">
                            Active Listings
                        </span>
                    )}
                </div>
            </Link>

            <HeartSaveButton targetId={agent.id} saveType="profile" initialSaved={agent.isSaved} isLoggedIn={true} />

            <Link prefetch={false} href={`/agents/${agent.id}`} className="block mt-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-heading text-sm truncate">{displayName}</p>
                    {agent.averageRating !== null && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-heading flex-shrink-0">
                            ★ {agent.averageRating.toFixed(1)}
                        </span>
                    )}
                </div>

                <p className="mt-0.5 text-xs text-body/60 truncate">Real Estate Agent</p>

                <div className="mt-2 flex flex-col gap-0.5 text-[11px]">
                    <span className="text-body/50">
                        {agent.activeListingsCount} active listing{agent.activeListingsCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-body/50">
                        {agent.reviewCount > 0
                            ? `${agent.reviewCount} review${agent.reviewCount === 1 ? "" : "s"}`
                            : "No reviews yet"}
                    </span>
                </div>
            </Link>
        </div>
    );
}

export function AgentsPageClient({ agents }: { agents: Agent[] }) {
    const filterOptions = ["All Agents", "With Active Listings"];
    const [activeFilter, setActiveFilter] = useState("All Agents");
    // const [query, setQuery] = useState("");

    const results = useMemo(() => {
        return agents.filter((a) => {
            if (activeFilter === "With Active Listings" && a.activeListingsCount === 0) return false;

            /*
            if (query) {
                const q = query.toLowerCase();
                const fullNameMatch = a.fullName?.toLowerCase().includes(q) ?? false;
                const businessNameMatch = a.businessName?.toLowerCase().includes(q) ?? false;
                if (!fullNameMatch && !businessNameMatch) return false;
            }
            */
            return true;
        });
    }, [agents, activeFilter]);

    return (
        <main className="min-h-screen bg-canvas py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">


                {/* Compact Filter */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {filterOptions.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${activeFilter === type
                                ? "bg-primary text-white border-primary font-semibold"
                                : "bg-card text-body border-border hover:border-primary/50 hover:text-heading"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Search is commented out
                <div className="flex items-center gap-3 w-full sm:w-80 rounded-full border border-border bg-card px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                    <svg className="h-4 w-4 text-body/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or business…"
                        className="flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-body/40"
                    />
                </div>
                */}

                {/* Results */}
                <div>
                    <p className="text-sm text-body/70 mb-5">
                        <span className="font-semibold text-heading">{results.length}</span>{" "}
                        agent{results.length !== 1 ? "s" : ""} found
                    </p>

                    {results.length === 0 ? (
                        <div className="py-24 text-center rounded-3xl border border-border bg-card flex flex-col items-center justify-center">
                            <p className="text-lg font-semibold text-heading">No agents match your filters</p>
                            <p className="mt-1 text-sm text-body/60 max-w-sm">Try adjusting your filters to see more agents.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {results.map((agent) => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
