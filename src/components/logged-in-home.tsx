"use client";

import { useState, useMemo } from "react";
import { CarouselRow } from "@/components/carousel-row";
import { AdUnit } from "@/components/ad-unit";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("All");
    const [maxPrice, setMaxPrice] = useState<string>("");

    const basePropertyTypes = ["All", "Room", "Apartment", "House", "Villa", "Office", "Shop"];
    const dynamicTypes = Array.from(new Set([
        ...newListings.map(l => l.propertyType),
        ...listingsByCity.flatMap(g => g.listings.map(l => l.propertyType))
    ]));
    const propertyTypes = Array.from(new Set([...basePropertyTypes, ...dynamicTypes]));

    const filteredNewListings = useMemo(() => {
        return newListings.filter(l => {
            const matchProperty = propertyFilter === "All" || l.propertyType === propertyFilter;
            const matchCity = cityFilter === "All" || l.city === cityFilter;
            const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                l.city.toLowerCase().includes(searchQuery.toLowerCase());
            const matchPrice = !maxPrice || l.price <= parseInt(maxPrice);
            return matchProperty && matchCity && matchSearch && matchPrice;
        });
    }, [newListings, propertyFilter, cityFilter, searchQuery, maxPrice]);

    const filteredListingsByCity = useMemo(() => {
        return listingsByCity.map(group => ({
            ...group,
            listings: group.listings.filter(l => {
                const matchProperty = propertyFilter === "All" || l.propertyType === propertyFilter;
                const matchCity = cityFilter === "All" || l.city === cityFilter;
                const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    l.city.toLowerCase().includes(searchQuery.toLowerCase());
                const matchPrice = !maxPrice || l.price <= parseInt(maxPrice);
                return matchProperty && matchCity && matchSearch && matchPrice;
            })
        })).filter(group => group.listings.length > 0 && (cityFilter === "All" || group.title === cityFilter));
    }, [listingsByCity, propertyFilter, cityFilter, searchQuery, maxPrice]);

    const allCities = ["All", ...Array.from(new Set([
        ...newListings.map(l => l.city),
        ...listingsByCity.map(g => g.title)
    ]))];

    return (
        <main className="min-h-screen bg-canvas py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
                
                {/* Compact Filter */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                        <div className="relative flex-1 w-full">
                            <input 
                                type="text" 
                                placeholder="Search properties or locations..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-card text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <svg className="w-5 h-5 text-body/50 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0">
                            <select 
                                value={cityFilter} 
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-full border border-border bg-card text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {allCities.map(city => (
                                    <option key={city} value={city}>{city === "All" ? "All Cities" : city}</option>
                                ))}
                            </select>
                            <div className="relative flex items-center shrink-0">
                                <span className="absolute left-3 text-body/50 font-medium">GH₵</span>
                                <input 
                                    type="number" 
                                    placeholder="Max Price" 
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="pl-11 pr-4 py-2.5 w-32 rounded-full border border-border bg-card text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {propertyTypes.map(type => (
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
                </div>

                {filteredNewListings.length > 0 && (
                    <CarouselRow title="New on DirectRent GH" type="listing" listings={filteredNewListings} viewAllHref="/listings" />
                )}
                
                {/* Inline tablet ad banner */}
                <div className="hidden md:block 2xl:hidden w-full h-[120px] rounded-2xl overflow-hidden shadow-sm relative my-4">
                    <AdUnit slot="5555555555" format="auto" className="w-full h-full" />
                </div>

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
