"use client";
import { useState } from "react";
import { ListingCard, Listing } from "@/components/listing-card";
import { AuthGuardLink } from "@/components/auth-guard-link";

type FilterGroup = "location" | "style" | "space";

const FILTER_GROUPS: {
  id: FilterGroup;
  label: string;
  icon: React.ReactNode;
  options: string[];
}[] = [
  {
    id: "location",
    label: "Location",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    options: ["All", "Accra", "Kumasi", "Tema", "Takoradi", "Kasoa", "Cape Coast"],
  },
  {
    id: "style",
    label: "Style",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    options: ["All", "Single Room", "Chamber & Hall", "Self-Contain", "Apartment", "Boys Quarters", "Compound House"],
  },
  {
    id: "space",
    label: "Space",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    options: ["All", "Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"],
  },
];

export function HomeListings({ listings }: { listings: Listing[] }) {
  const [activeGroup, setActiveGroup] = useState<FilterGroup>("location");
  const [activeFilter, setActiveFilter] = useState<Record<FilterGroup, string>>({
    location: "All",
    style: "All",
    space: "All",
  });

  const currentGroup = FILTER_GROUPS.find((g) => g.id === activeGroup)!;

  const filtered = listings.filter((l) => {
    const loc = activeFilter.location;
    const sty = activeFilter.style;
    const spc = activeFilter.space;
    
    // Map database values for filtering logic (very simplistic for now)
    const matchesLoc = loc === "All" || (l.area && l.area.includes(loc));
    const matchesSty = sty === "All" || (l.style === sty);
    
    let matchesSpc = spc === "All";
    if (spc !== "All") {
      if (spc === "Studio" && (!l.beds || l.beds === 0)) matchesSpc = true;
      if (spc === "1 Bedroom" && l.beds === 1) matchesSpc = true;
      if (spc === "2 Bedrooms" && l.beds === 2) matchesSpc = true;
      if (spc === "3 Bedrooms" && l.beds === 3) matchesSpc = true;
      if (spc === "4+ Bedrooms" && (l.beds ?? 0) >= 4) matchesSpc = true;
    }

    return matchesLoc && matchesSty && matchesSpc;
  });

  function setFilter(group: FilterGroup, value: string) {
    setActiveFilter((prev) => ({ ...prev, [group]: value }));
  }

  return (
    <>
      {/* ── Group tabs ── */}
      <div className="flex gap-1 mb-4">
        {FILTER_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border ${
              activeGroup === g.id
                ? "bg-heading text-white dark:text-slate-900 border-heading"
                : "bg-card text-body border-border hover:border-primary/40 hover:text-heading"
            }`}
          >
            {g.icon}
            {g.label}
          </button>
        ))}
      </div>

      {/* ── Sub-filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
        {currentGroup.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(activeGroup, opt)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm border transition ${
              activeFilter[activeGroup] === opt
                ? "bg-primary text-white border-primary font-semibold"
                : "bg-card text-body border-border hover:border-primary/50 hover:text-heading"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-body/60">
          <p className="text-lg font-semibold text-heading">No listings match your filter</p>
          <p className="mt-1 text-sm">Try selecting &quot;All&quot; or a different option above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <AuthGuardLink href={`/listings/${p.id}`} key={p.id} className="block">
                <ListingCard listing={p} />
            </AuthGuardLink>
          ))}
        </div>
      )}

      {/* View all CTA */}
      <div className="mt-12 text-center">
        <a
          href="/listings"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-heading shadow-sm transition hover:border-primary hover:text-primary hover:shadow-md"
        >
          View all listings
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </>
  );
}
