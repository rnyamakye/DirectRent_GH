"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const boostDurations = [
  { days: 7, label: "1 week", cost: 20 },
  { days: 14, label: "2 weeks", cost: 35 },
  { days: 30, label: "1 month", cost: 60 },
];

export default function BoostListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<{ title: string; price: number } | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error: fetchError } = await supabase
        .from("listings")
        .select("title, price, agent_id")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        router.push("/agent/dashboard");
        return;
      }

      if (data.agent_id !== user?.id) {
        router.push("/agent/dashboard");
        return;
      }

      setListing({ title: data.title, price: data.price });
      setLoading(false);
    }

    loadListing();
  }, [id, router]);

  const selectedDuration = boostDurations.find((d) => d.days === selectedDays)!;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/payments/boost/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "listing", targetId: id, days: selectedDays }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      setSubmitting(false);
      return;
    }

    window.location.href = data.authorizationUrl;
  }

  if (loading || !listing) {
    return <p className="font-supporting text-sm text-body">Loading...</p>;
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-6 max-w-sm">
      <h1 className="text-xl font-bold">Boost listing</h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold text-heading">{listing.title}</p>
        <p className="font-semibold text-primary">GHS {listing.price}/mo</p>
      </div>

      <div>
        <p className="font-supporting text-xs text-body mb-2">Boost duration</p>
        <div className="flex flex-col gap-2">
          {boostDurations.map((duration) => (
            <label
              key={duration.days}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm font-supporting cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="duration"
                  checked={selectedDays === duration.days}
                  onChange={() => setSelectedDays(duration.days)}
                />
                {duration.label}
              </span>
              <span className="font-semibold">GHS {duration.cost}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="font-supporting text-xs text-body">
        You&apos;ll enter your Mobile Money details on the next screen
        (Paystack&apos;s secure checkout).
      </p>

      <div className="rounded-xl bg-mint p-4 flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>GHS {selectedDuration.cost}</span>
      </div>

      {error && <p className="text-xs font-supporting text-accent">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Processing..." : `Pay GHS ${selectedDuration.cost}`}
      </button>
    </form>
  );
}