"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet's default icon missing issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude ? new L.LatLng(latitude, longitude) : null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>(
    latitude && longitude ? [latitude, longitude] : [5.6037, -0.1870]
  );

  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position, onChange]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=gh`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (lat: string, lon: string) => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    
    const newPos = new L.LatLng(parsedLat, parsedLon);
    setPosition(newPos);
    setMapCenter([parsedLat, parsedLon]);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar Overlay */}
      <div className="relative z-[1000]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a neighborhood or landmark..."
            className="flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm text-heading focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-70"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-border max-h-60 overflow-y-auto z-[1000]">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelectLocation(result.lat, result.lon)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-border/50 last:border-0 text-sm text-heading transition"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
}
