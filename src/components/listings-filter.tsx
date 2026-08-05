"use client";

import Link from "next/link";
import { useState } from "react";

export function ListingsFilter({
  area,
  minPrice,
  maxPrice,
}: {
  area?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = !!(area || minPrice || maxPrice);

  return (
    <div className="w-full sm:w-auto">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden w-full flex items-center justify-between bg-white border border-border rounded-[16px] px-5 py-3 shadow-sm mb-4"
      >
        <span className="font-semibold text-heading text-sm">
          {hasActiveFilters ? "Filters Applied" : "Filter Properties"}
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

      {/* Filter Form */}
      <form
        action="/listings"
        method="GET"
        className={`flex-col sm:flex-row items-center gap-3 w-full sm:w-auto ${
          isOpen ? "flex" : "hidden sm:flex"
        }`}
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
        <button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-2 text-sm font-bold transition"
        >
          Filter
        </button>
        {hasActiveFilters && (
          <Link
            href="/listings"
            className="text-xs font-semibold text-primary hover:text-primary-hover transition text-center sm:text-left"
          >
            Reset
          </Link>
        )}
      </form>
    </div>
  );
}
