"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

export default function LocationPicker({
    latitude,
    longitude,
    onChange,
}: {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}) {
    // Defaults to central Accra when nothing's been picked yet, rather
    // than an unhelpful (0, 0) mid-ocean view.
    const center: [number, number] =
        latitude != null && longitude != null ? [latitude, longitude] : [5.6037, -0.187];

    return (
        <div className="rounded-xl overflow-hidden border border-border h-64">
            <MapContainer center={center} zoom={latitude != null ? 15 : 7} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickHandler onPick={onChange} />
                {latitude != null && longitude != null && <Marker position={[latitude, longitude]} />}
            </MapContainer>
        </div>
    );
}