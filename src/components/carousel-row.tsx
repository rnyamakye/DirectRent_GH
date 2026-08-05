"use client";

import { useRef } from "react";
import Link from "next/link";
import { AuthGuardLink } from "@/components/auth-guard-link";
import { HeartSaveButton } from "@/components/heart-save-button";

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
    isSaved?: boolean;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
        </svg>
    );
}

function ListingCard({ listing }: { listing: Listing }) {
    return (
        <div className="relative flex-shrink-0 w-36 sm:w-64">
            <AuthGuardLink href={`/listings/${listing.id}`} className="block">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-mint">
                    <img
                        src={listing.photoUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600"}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </AuthGuardLink>

            {/* Heart save */}
            <HeartSaveButton targetId={listing.id} initialSaved={listing.isSaved} isLoggedIn={true} />

            <AuthGuardLink href={`/listings/${listing.id}`} className="block mt-2">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-heading truncate">
                        {listing.propertyType} in {listing.city}
                    </p>
                    {listing.rating !== null && (
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-heading flex-shrink-0">
                            ★ {listing.rating.toFixed(1)}
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-body mt-0.5">
                    GHS {listing.price.toLocaleString()} <span className="text-body/60">/ mo</span>
                </p>
            </AuthGuardLink>
        </div>
    );
}

function ArtisanCard({ artisan }: { artisan: Artisan }) {
    return (
        <div className="relative flex-shrink-0 w-36 sm:w-64 block">
            <Link href={`/artisans/${artisan.id}`} className="block">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-mint">
                    <img
                        src={artisan.photoUrl || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"}
                        alt={artisan.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>

            <HeartSaveButton targetId={artisan.id} saveType="profile" initialSaved={artisan.isSaved} isLoggedIn={true} />

            <Link href={`/artisans/${artisan.id}`} className="block mt-2">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-heading truncate">{artisan.name}</p>
                    {artisan.rating !== null && (
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-heading flex-shrink-0">
                            ★ {artisan.rating.toFixed(1)}
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-body mt-0.5">{artisan.trade}</p>
            </Link>
        </div>

    );
}

type CarouselRowProps = {
    title: string;
    viewAllHref?: string;
} & (
        | { type: "listing"; listings: Listing[] }
        | { type: "artisan"; artisans: Artisan[] }
    );

export function CarouselRow(props: CarouselRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scroll(direction: "left" | "right") {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.9;
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-heading">{props.title}</h2>
                <div className="flex items-center gap-2">
                    {props.viewAllHref && (
                        <Link href={props.viewAllHref} className="flex items-center justify-center text-primary hover:text-primary/70 transition-colors sm:mr-2" aria-label="View more">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}
                    <div className="hidden sm:flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-heading hover:border-primary/40 transition"
                            aria-label="Scroll left"
                        >
                            <ArrowIcon direction="left" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-heading hover:border-primary/40 transition"
                            aria-label="Scroll right"
                        >
                            <ArrowIcon direction="right" />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
                {props.type === "listing"
                    ? props.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
                    : props.artisans.map((artisan) => <ArtisanCard key={artisan.id} artisan={artisan} />)}
            </div>
        </section>
    );
}