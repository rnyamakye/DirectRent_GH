"use client";

import { useState, useMemo } from "react";
import { CarouselRow } from "@/components/carousel-row";

type Listing = {
    id: string;
    title: string;
    city: string;
    propertyType: string;
    price: number;
    photoUrl: string | null;
    rating: number | null;
    isSaved: boolean;
};

type Artisan = {
    id: string;
    name: string;
    trade: string;
    photoUrl: string | null;
    rating: number | null;
    isSaved: boolean;
};

export function LoggedInHome({
    newListings,
    listingsByCity,
    artisans,
}: {
    newListings: Listing[];
    listingsByCity: { title: string; listings: Listing[] }[];
    artisans: Artisan[];
}) {
    const [propertyFilter, setPropertyFilter] = useState("All");

    const propertyTypes = ["All", ...Array.from(new Set([
        ...newListings.map(l => l.propertyType),
        ...listingsByCity.flatMap(g => g.listings.map(l => l.propertyType))
    ]))];

    const filteredNewListings = useMemo(() => {
        if (propertyFilter === "All") return newListings;
        return newListings.filter(l => l.propertyType === propertyFilter);
    }, [newListings, propertyFilter]);

    const filteredListingsByCity = useMemo(() => {
        if (propertyFilter === "All") return listingsByCity;
        return listingsByCity.map(group => ({
            ...group,
            listings: group.listings.filter(l => l.propertyType === propertyFilter)
        })).filter(group => group.listings.length > 0);
    }, [listingsByCity, propertyFilter]);

    return (
        <main className="min-h-screen bg-canvas py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
                
                {/* Compact Filter */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {propertyTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setPropertyFilter(type)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${
                                propertyFilter === type
                                    ? "bg-primary text-white border-primary font-semibold"
                                    : "bg-card text-body border-border hover:border-primary/50 hover:text-heading"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {filteredNewListings.length > 0 && (
                    <CarouselRow title="New on DirectRent GH" type="listing" listings={filteredNewListings} viewAllHref="/listings" />
                )}
                {filteredListingsByCity.map((group) => (
                    <CarouselRow key={group.title} title={group.title} type="listing" listings={group.listings} viewAllHref="/listings" />
                ))}
                
                {/* Artisans don't get filtered by property type */}
                {artisans.length > 0 && (
                    <CarouselRow title="Artisans ready to help" type="artisan" artisans={artisans} viewAllHref="/artisans" />
                )}
            </div>
        </main>
    );
}