"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface ListingLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price: number;
  photoUrl?: string;
}

interface MapProps {
  listings: ListingLocation[];
  center?: [number, number];
  zoom?: number;
}

export default function Map({ listings, center = [5.6037, -0.1870], zoom = 12 }: MapProps) {
  useEffect(() => {
    // Invalidate size on mount to prevent partial map render in flex layouts
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-full z-0 rounded-2xl border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {listings.map((listing) => {
        if (!listing.lat || !listing.lng) return null;
        return (
          <Marker key={listing.id} position={[listing.lat, listing.lng]}>
            <Popup className="rounded-xl overflow-hidden">
              <div className="flex flex-col gap-2 min-w-[200px]">
                {listing.photoUrl && (
                  <img
                    src={listing.photoUrl}
                    alt={listing.title}
                    className="w-full h-24 object-cover rounded-t-lg -mt-3 -mx-4 max-w-[calc(100%+2rem)]"
                  />
                )}
                <div className="font-semibold text-heading truncate">{listing.title}</div>
                <div className="font-bold text-primary">GHS {listing.price}/mo</div>
                <Link
                  href={`/listings/${listing.id}`}
                  className="mt-2 text-center bg-primary hover:bg-primary-hover text-white rounded-lg py-1.5 text-xs font-semibold"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
