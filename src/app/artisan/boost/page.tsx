"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const boostDurations = [
  { days: 7, label: "1 week", cost: 15 },
  { days: 14, label: "2 weeks", cost: 25 },
  { days: 30, label: "1 month", cost: 45 },
];

export default function BoostArtisanProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; type: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");

  const selectedDuration = boostDurations.find((d) => d.days === selectedDays)!;

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("full_name, business_name, role")
        .eq("id", user.id)
        .single();

      if (fetchError || !data || data.role !== "artisan") {
        router.push("/artisan/dashboard");
        return;
      }

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance_pesewas")
        .eq("user_id", user.id)
        .single();
        
      if (wallet) {
          setWalletBalance(wallet.balance_pesewas);
      }

      setUserId(user.id);
      setProfile({
        name: data.business_name ?? data.full_name ?? "Artisan",
        type: "Artisan Profile",
      });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    setError("");

    if (paymentMethod === "wallet") {
        const res = await fetch("/api/payments/boost/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetType: "artisan", targetId: userId, days: selectedDays }),
        });

        const data = await res.json();
        
        if (!res.ok) {
            setError(data.error ?? "Could not start payment.");
            setSubmitting(false);
            return;
        }

        router.push(data.redirectUrl);
        return;
    }

    const res = await fetch("/api/payments/boost/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "artisan", targetId: userId, days: selectedDays }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      setSubmitting(false);
      return;
    }

    window.location.href = data.authorizationUrl;
  }

  if (loading || !profile) {
    return <p className="font-supporting text-sm text-body">Loading...</p>;
  }

  const hasSufficientWalletBalance = walletBalance >= selectedDuration.cost * 100;

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-6 max-w-sm">
      <h1 className="text-xl font-bold">Boost your profile</h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold text-heading">{profile.name}</p>
        <p className="font-supporting text-sm text-primary">{profile.type}</p>
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
      
      <div>
        <p className="font-supporting text-xs text-body mb-2">Payment Method</p>
        <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-supporting cursor-pointer">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "paystack"}
                  onChange={() => setPaymentMethod("paystack")}
                />
                Pay with Mobile Money/Card
              </span>
            </label>
            <label className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-supporting cursor-pointer ${!hasSufficientWalletBalance ? 'opacity-50 border-border' : 'border-border'}`}>
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "wallet"}
                  disabled={!hasSufficientWalletBalance}
                  onChange={() => setPaymentMethod("wallet")}
                />
                Pay with Wallet Balance
              </span>
              <span className="text-xs text-body/60">GHS {(walletBalance/100).toFixed(2)} available</span>
            </label>
        </div>
      </div>

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
