"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "renter" | "agent" | "artisan";

export default function SelectRolePage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role) {
                router.push(`/${profile.role}/dashboard`);
                return;
            }

            setChecking(false);
        }
        check();
    }, [router]);

    function isValidGhanaPhone(value: string) {
        // Accepts 0XXXXXXXXX (10 digits) or +233XXXXXXXXX — the two
        // formats renters/agents/artisans would realistically type.
        return /^0\d{9}$/.test(value) || /^\+233\d{9}$/.test(value);
    }

    async function handleContinue() {
        setError("");

        if (!selectedRole) {
            setError("Choose how you'll be using DirectRent GH.");
            return;
        }
        if (!isValidGhanaPhone(phone.trim())) {
            setError("Enter a valid phone number (e.g. 0244000000).");
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: selectedRole, phone: phone.trim() })
            .eq("id", user.id);

        setSaving(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        router.push(`/${selectedRole}/dashboard`);
    }

    if (checking) {
        return <p className="font-supporting text-sm text-body">Loading...</p>;
    }

    const roles: { value: Role; label: string }[] = [
        { value: "renter", label: "Renter — looking for a room" },
        { value: "agent", label: "Agent — listing properties" },
        { value: "artisan", label: "Artisan — offering a service" },
    ];

    return (
        <main className="flex-1 flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-xl font-bold">One more thing</h1>
                    <p className="font-supporting text-sm text-body mt-1">
                        How will you be using DirectRent GH?
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {roles.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setSelectedRole(r.value)}
                            className={`border rounded-lg px-4 py-3 text-left font-semibold transition ${selectedRole === r.value
                                    ? "border-primary bg-mint/30 text-primary"
                                    : "border-border hover:border-primary/40"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div>
                    <label className="font-supporting text-xs text-body mb-1 block">
                        Phone number
                    </label>
                    <input
                        type="tel"
                        placeholder="0244000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                    <p className="font-supporting text-[11px] text-body/60 mt-1">
                        Renters, agents, and artisans need a real number so people can reach you.
                    </p>
                </div>

                {error && <p className="text-xs font-supporting text-accent">{error}</p>}

                <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Continue"}
                </button>
            </div>
        </main>
    );
}