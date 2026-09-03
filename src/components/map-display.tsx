"use client";

import dynamic from "next/dynamic";

const MapDisplayInner = dynamic(() => import("./map-display-inner"), { ssr: false });

export default function MapDisplay({ latitude, longitude }: { latitude: number, longitude: number }) {
  return <MapDisplayInner latitude={latitude} longitude={longitude} />;
}
