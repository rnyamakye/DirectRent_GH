"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const boostDurations = [
  { days: 7, label: "1 week", cost: 15 },
  { days: 14, label: "2 weeks", cost: 25 },
  { days: 30, label: "1 month", cost: 45 },
];

export default function BoostArtisanProfilePage() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState(7);
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDuration = boostDurations.find((d) => d.days === selectedDays)!;

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // TODO: once the backend exists:
    //   await api.post("/payments/boost", { targetType: "artisan", targetId: "me", days: selectedDays, network, phone })
    const isValidGhanaianNumber = /^0\d{9}$/.test(phone);

    setTimeout(() => {
      if (isValidGhanaianNumber) {
        router.push(`/artisan/boost/success?days=${selectedDays}`);
      } else {
        router.push("/artisan/boost/failed?reason=Invalid+phone+number");
      }
    }, 800);
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-6 max-w-sm">
      <h1 className="text-xl font-bold">Boost your profile</h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold text-heading">Yaw Boateng</p>
        <p className="font-supporting text-sm text-primary">Electrician</p>
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

      <div className="flex flex-col gap-3">
        <p className="font-supporting text-xs text-body">Mobile Money details</p>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
        >
          <option value="MTN">MTN Mobile Money</option>
          <option value="Telecel">Telecel Cash</option>
          <option value="AirtelTigo">AirtelTigo Money</option>
        </select>
        <input
          type="tel"
          required
          placeholder="0244000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-supporting"
        />
      </div>

      <div className="rounded-xl bg-mint p-4 flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>GHS {selectedDuration.cost}</span>
      </div>

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