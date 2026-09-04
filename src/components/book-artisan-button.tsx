"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Load the map with no SSR — Leaflet uses browser APIs
const LocationPicker = dynamic(() => import("@/components/location-picker"), { ssr: false });

export type Booking = {
  id: string;
  artisan_id: string;
  renter_id: string;
  booking_date: string;
  booking_time: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

type Props = {
  artisanId: string;
  artisanName: string;
  artisanPhone?: string | null;
  existingBooking: Booking | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Free reverse geocoding via Nominatim (no API key required)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const json = await res.json();
    return json.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function BookArtisanButton({ artisanId, artisanName, artisanPhone, existingBooking }: Props) {
  const [booking, setBooking] = useState<Booking | null>(existingBooking);
  const [modalOpen, setModalOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [geocoding, setGeocoding] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Address search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useState<ReturnType<typeof setTimeout> | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Reverse geocode whenever the user pins a new location
  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    setGeocoding(true);
    reverseGeocode(lat, lng).then((result) => {
      if (!cancelled) {
        setAddress(result);
        setGeocoding(false);
      }
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  function handleMapPick(pickedLat: number, pickedLng: number) {
    setLat(pickedLat);
    setLng(pickedLng);
    setGeoError(null);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please allow location access and try again.");
        } else {
          setGeoError("Could not get your location. Please pin it on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    setShowDropdown(false);
    if (searchTimeout[0]) clearTimeout(searchTimeout[0]);
    if (value.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeout[0] = setTimeout(() => runSearch(value), 400);
  }

  async function runSearch(query = searchQuery) {
    if (!query.trim()) return;
    setSearching(true);
    setShowDropdown(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&countrycodes=gh`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSelectResult(result: { display_name: string; lat: string; lon: string }) {
    const pickedLat = parseFloat(result.lat);
    const pickedLng = parseFloat(result.lon);
    setLat(pickedLat);
    setLng(pickedLng);
    setSearchQuery(result.display_name);
    setShowDropdown(false);
    setGeoError(null);
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (lat == null || lng == null) {
      setError("Please pin your location on the map.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisan_id: artisanId,
          booking_date: date,
          booking_time: time,
          location: address,
          latitude: lat,
          longitude: lng,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create booking");
        return;
      }
      setBooking(json.booking);
      setModalOpen(false);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "PATCH" });
      if (res.ok) setBooking(null);
    } catch { /* silent */ }
    finally { setCancelling(false); }
  }

  // ── State: Booking exists — show contact + cancel ────────────────────────────
  if (booking) {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* Booking status card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-bold text-emerald-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Booking {booking.status === "pending" ? "Pending" : "Confirmed"}
          </div>
          <div className="text-emerald-800 space-y-0.5">
            <p>📅 {formatDate(booking.booking_date)}</p>
            <p>🕐 {formatTime(booking.booking_time)}</p>
            <p>📍 {booking.location}</p>
          </div>
        </div>

        {/* Revealed contact info */}
        {booking.status === "confirmed" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-body/50">
              Contact {artisanName.split(" ")[0]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  setMessaging(true);
                  const { createClient } = await import("@/lib/supabase/client");
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    // Check if conversation exists
                    let { data: conv } = await supabase
                      .from("conversations")
                      .select("id")
                      .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${artisanId}),and(participant_one_id.eq.${artisanId},participant_two_id.eq.${user.id})`)
                      .single();

                    if (!conv) {
                      const { data: newConv } = await supabase
                        .from("conversations")
                        .insert({ participant_one_id: user.id, participant_two_id: artisanId })
                        .select("id")
                        .single();
                      conv = newConv;
                    }

                    if (conv) {
                      window.location.href = `/renter/messages?conversationId=${conv.id}`;
                    }
                  }
                  setMessaging(false);
                }}
                disabled={messaging}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition group text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg group-hover:scale-110 transition-transform">
                  {messaging ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    "✉️"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-heading text-sm truncate">Message</p>
                  <p className="text-xs text-body truncate">Chat securely</p>
                </div>
              </button>

              {artisanPhone && (
                <a
                  href={`tel:${artisanPhone}`}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-50 transition group text-left"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg group-hover:scale-110 transition-transform">
                    📞
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-heading text-sm truncate">Call</p>
                    <p className="text-xs text-body truncate">{artisanPhone}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Cancel */}
        {booking.status === "pending" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-1 w-full rounded-xl border border-red-300 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel Booking"}
          </button>
        )}
      </div>
    );
  }

  // ── State: No booking — Book button + modal ───────────────────────────────────
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3 font-bold hover:bg-primary-hover transition"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 9h12v7H4V9z" clipRule="evenodd" />
        </svg>
        Book Artisan
      </button>

      {/* ── Booking modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-heading">Book {artisanName.split(" ")[0]}</h2>
                <p className="text-xs text-body/60 mt-0.5">Choose a date, time, and pin your location</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-border/50 text-body hover:bg-border transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleBook} className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">

              {/* Date + Time row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-date" className="text-xs font-bold uppercase tracking-widest text-body/50">
                    Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-time" className="text-xs font-bold uppercase tracking-widest text-body/50">
                    Time
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              {/* Location search + Map */}
              <div className="flex flex-col gap-2">
                {/* Row: label + GPS button */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-body/50">
                    Your Location <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition disabled:opacity-50"
                  >
                    {geoLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Locating…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                        </svg>
                        Use my location
                      </>
                    )}
                  </button>
                </div>

                {/* Address search input with dropdown */}
                <div className="relative">
                  <div className="flex gap-2">
                    {/* Input */}
                    <div className="relative flex-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-body/40 pointer-events-none">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search address, area or landmark…"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
                        className="w-full rounded-xl border border-border bg-canvas pl-9 pr-3 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                    {/* Search button */}
                    <button
                      type="button"
                      onClick={() => runSearch()}
                      disabled={searching || !searchQuery.trim()}
                      className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 rounded-xl hover:bg-primary-hover transition disabled:opacity-50"
                    >
                      {searching ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                        </svg>
                      )}
                      Search
                    </button>
                  </div>
                  {showDropdown && searchResults.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      {searchResults.map((result, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => handleSelectResult(result)}
                            className="w-full text-left px-4 py-2.5 text-sm text-heading hover:bg-primary/5 transition flex items-start gap-2"
                          >
                            <span className="mt-0.5 flex-shrink-0">📍</span>
                            <span className="line-clamp-2">{result.display_name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="text-xs text-body/50">Or tap the map directly to place a pin</p>
                {geoError && <p className="text-xs text-red-500 font-medium">{geoError}</p>}

                {/* Map */}
                <LocationPicker
                  latitude={lat}
                  longitude={lng}
                  onChange={handleMapPick}
                  hideSearch={true}
                />

                {/* Resolved address confirmation */}
                <div className="min-h-[28px] flex items-start gap-2">
                  {geocoding ? (
                    <span className="text-xs text-body/50 italic">Resolving address…</span>
                  ) : address ? (
                    <div className="flex gap-1.5 items-start">
                      <span className="text-sm">📍</span>
                      <p className="text-xs text-body leading-relaxed">{address}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-body/40 italic">No location selected yet</span>
                  )}
                </div>
              </div>


              {error && (
                <p className="text-sm text-red-600 font-medium -mt-2">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-heading hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || geocoding || lat == null}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover transition disabled:opacity-60"
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
