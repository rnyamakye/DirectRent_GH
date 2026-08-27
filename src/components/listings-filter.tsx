"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { MapLoader } from "@/components/map-loader";
import type { ListingLocation } from "@/components/map";

export function ListingsFilter({
  area,
  minPrice,
  maxPrice,
  selfContained,
  sharedKitchen,
  sharedBathroom,
  mapListings = [],
}: {
  area?: string;
  minPrice?: string;
  maxPrice?: string;
  selfContained?: string;
  sharedKitchen?: string;
  sharedBathroom?: string;
  mapListings?: ListingLocation[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelfContained, setIsSelfContained] = useState(selfContained === "1");
  const [isSharedKitchen, setIsSharedKitchen] = useState(sharedKitchen === "1");
  const [isSharedBathroom, setIsSharedBathroom] = useState(sharedBathroom === "1");
  const [isSaving, setIsSaving] = useState(false);
  const hasActiveFilters = !!(area || minPrice || maxPrice || isSelfContained || isSharedKitchen || isSharedBathroom);

  const handleSaveSearch = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: area,
          min_price: minPrice,
          max_price: maxPrice,
          // If we had property type in state we'd pass it here, but we can pass generic ones for now
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("You must be logged in to save a search.");
        }
        throw new Error(data.error || "Failed to save search.");
      }
      toast.success("Search saved! We'll notify you when new listings match.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      {/* Mobile Toggle Button */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white border border-border rounded-[16px] px-5 py-3 shadow-sm"
        >
          <span className="font-semibold text-heading text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            {hasActiveFilters ? "Filters Applied" : "Filter & Map"}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-5 w-5 text-body/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Form (collapsible on mobile) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out sm:!max-h-none sm:!opacity-100 ${
          isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0 sm:opacity-100"
        }`}
      >
        <form
          action="/listings"
          method="GET"
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-1 sm:pt-0"
        >
          <input
            type="text"
            name="area"
            defaultValue={area}
            placeholder="Area (e.g. Osu)"
            className="w-full sm:w-40 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              name="minPrice"
              defaultValue={minPrice}
              placeholder="Min GHS"
              className="w-full sm:w-28 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
            <span className="text-body/50">-</span>
            <input
              type="number"
              name="maxPrice"
              defaultValue={maxPrice}
              placeholder="Max GHS"
              className="w-full sm:w-28 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Room type toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsSelfContained(!isSelfContained)}
              className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold border transition select-none ${isSelfContained ? "bg-primary text-white border-primary" : "bg-card text-body border-border hover:border-primary/50"}`}
            >
              Self Contained
            </button>
            {isSelfContained && <input type="hidden" name="selfContained" value="1" />}

            <button
              type="button"
              onClick={() => setIsSharedKitchen(!isSharedKitchen)}
              className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold border transition select-none ${isSharedKitchen ? "bg-primary text-white border-primary" : "bg-card text-body border-border hover:border-primary/50"}`}
            >
              Shared Kitchen
            </button>
            {isSharedKitchen && <input type="hidden" name="sharedKitchen" value="1" />}

            <button
              type="button"
              onClick={() => setIsSharedBathroom(!isSharedBathroom)}
              className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold border transition select-none ${isSharedBathroom ? "bg-primary text-white border-primary" : "bg-card text-body border-border hover:border-primary/50"}`}
            >
              Shared Bathroom
            </button>
            {isSharedBathroom && <input type="hidden" name="sharedBathroom" value="1" />}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2 text-sm font-bold transition"
          >
            Filter
          </button>
          {hasActiveFilters && (
            <>
              <Link
                href="/listings"
                className="text-xs font-semibold text-primary hover:text-primary-hover transition text-center sm:text-left"
              >
                Reset
              </Link>
              <button
                type="button"
                onClick={handleSaveSearch}
                disabled={isSaving}
                className="flex items-center gap-1 w-full sm:w-auto bg-mint/50 hover:bg-mint text-primary rounded-full px-4 py-2 text-sm font-bold transition whitespace-nowrap ml-auto sm:ml-2 disabled:opacity-50"
              >
                {isSaving ? <Spinner className="w-3.5 h-3.5" /> : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
                Save Search
              </button>
            </>
          )}
        </form>

        {/* Mobile Map — always shown inside dropdown on small screens */}
        {mapListings.length > 0 ? (
          <div className="sm:hidden mt-4 h-64 rounded-2xl overflow-hidden border border-border shadow-sm">
            <MapLoader listings={mapListings} />
          </div>
        ) : (
          <div className="sm:hidden mt-4 h-32 rounded-2xl border border-border bg-slate-50 flex items-center justify-center text-body/50 text-sm">
            No listings with location data.
          </div>
        )}
      </div>
    </div>
  );
}
