"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon breaks under Next's bundler unless
// pointed at real image URLs explicitly — a known, standard fix,
// not a workaround specific to this project.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Flies the map to new coordinates whenever they change — needed because
// MapContainer's `center` prop is only used on first render by Leaflet.
function FlyToLocation({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();
    useEffect(() => {
        if (lat != null && lng != null) {
            map.flyTo([lat, lng], 16, { duration: 1.2 });
        }
    }, [lat, lng, map]);
    return null;
}

// Invalidates the map size when the container resizes (e.g. fullscreen toggle)
function InvalidateOnResize({ trigger }: { trigger: boolean }) {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 50);
    }, [trigger, map]);
    return null;
}

export default function LocationPicker({
    latitude,
    longitude,
    onChange,
}: {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const initialCenter: [number, number] = [5.6037, -0.187];

    const mapContent = (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={onChange} />
            <FlyToLocation lat={latitude} lng={longitude} />
            <InvalidateOnResize trigger={isFullscreen} />
            {latitude != null && longitude != null && <Marker position={[latitude, longitude]} />}
        </>
    );

    // Fullscreen overlay
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[300] bg-black">
                {/* Header bar */}
                <div className="absolute top-0 left-0 right-0 z-[301] flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm">
                    <span className="text-white text-sm font-semibold">📍 Tap to pin your location</span>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(false)}
                        className="flex items-center gap-1.5 bg-white text-heading text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-100 transition shadow"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                            <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Exit fullscreen
                    </button>
                </div>

                {/* Full-page map */}
                <MapContainer center={initialCenter} zoom={7} className="h-full w-full" zoomControl={false}>
                    {mapContent}
                </MapContainer>

                {/* Zoom controls repositioned to bottom-right */}
                {latitude != null && longitude != null && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[301] bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg text-xs text-body text-center">
                        📍 Pin placed — tap elsewhere to move it
                    </div>
                )}
            </div>
        );
    }

    // Normal inline map with fullscreen button overlay
    return (
        <div className="relative rounded-xl overflow-hidden border border-border h-64">
            <MapContainer center={initialCenter} zoom={7} className="h-full w-full">
                {mapContent}
            </MapContainer>

            {/* Fullscreen toggle button */}
            <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="Expand map"
                className="absolute top-2 right-2 z-[400] bg-white text-heading rounded-lg p-1.5 shadow-md hover:bg-slate-50 transition border border-border/50"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}