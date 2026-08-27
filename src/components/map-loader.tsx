"use client";

import dynamic from "next/dynamic";
import { type ListingLocation } from "./map";

const MapComponent = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card border border-border rounded-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

interface MapLoaderProps {
  listings: ListingLocation[];
  center?: [number, number];
  zoom?: number;
}

export function MapLoader(props: MapLoaderProps) {
  return <MapComponent {...props} />;
}
