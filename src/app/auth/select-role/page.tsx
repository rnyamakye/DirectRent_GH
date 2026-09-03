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

    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 2 states
    const [location, setLocation] = useState("");
    const [occupation, setOccupation] = useState("");
    const [bio, setBio] = useState("");
    const [interests, setInterests] = useState(""); // Comma separated
    const [languages, setLanguages] = useState(""); // Comma separated

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/auth/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role) {
                router.replace(`/${profile.role}/dashboard`);
                return;
            }

            setChecking(false);
        }
        check();
    }, [router]);

    function isValidGhanaPhone(value: string) {
        return /^0\d{9}$/.test(value) || /^\+233\d{9}$/.test(value);
    }

    function handleNextStep() {
        setError("");
        if (!selectedRole) {
            setError("Choose how you'll be using DirectRent GH.");
            return;
        }
        if (!isValidGhanaPhone(phone.trim())) {
            setError("Enter a valid phone number (e.g. 0244000000).");
            return;
        }
        setStep(2);
    }

    async function handleSave(skipOptional: boolean = false) {
        setError("");
        setSaving(true);
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
            setSaving(false);
            return;
        }

        const updates: any = { 
            role: selectedRole, 
            phone: phone.trim() 
        };

        if (!skipOptional) {
            if (location.trim()) updates.location = location.trim();
            if (occupation.trim()) updates.occupation = occupation.trim();
            if (bio.trim()) updates.bio = bio.trim();
            if (selectedRole === 'agent') {
                if (languages.trim()) updates.languages = languages.trim();
            } else {
                if (interests.trim()) {
                    updates.interests = interests.split(",").map(i => i.trim()).filter(i => i);
                }
            }
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id);

        setSaving(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        router.replace(`/${selectedRole}/dashboard`);
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
                
                {step === 1 ? (
                    <>
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
                            onClick={handleNextStep}
                            className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 text-sm font-semibold transition"
                        >
                            Continue
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-center">
                            <h1 className="text-xl font-bold">Tell us about yourself</h1>
                            <p className="font-supporting text-sm text-body mt-1">
                                This helps people get to know you better.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="font-supporting text-xs text-body mb-1 block">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Accra, Ghana"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="font-supporting text-xs text-body mb-1 block">
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Software Engineer, Student"
                                    value={occupation}
                                    onChange={(e) => setOccupation(e.target.value)}
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                />
                            </div>

                            {selectedRole === "agent" ? (
                                <div>
                                    <label className="font-supporting text-xs text-body mb-1 block">
                                        Languages spoken <span className="text-body/50">(optional, comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. English, Twi, Ga"
                                        value={languages}
                                        onChange={(e) => setLanguages(e.target.value)}
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="font-supporting text-xs text-body mb-1 block">
                                        Interests <span className="text-body/50">(optional, comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Reading, Hiking, Coding"
                                        value={interests}
                                        onChange={(e) => setInterests(e.target.value)}
                                        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="font-supporting text-xs text-body mb-1 block">
                                    About Me
                                </label>
                                <textarea
                                    placeholder="A short bio about yourself..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                />
                            </div>
                        </div>

                        {error && <p className="text-xs font-supporting text-accent">{error}</p>}

                        <div className="flex flex-col gap-2 mt-2">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50 transition"
                            >
                                {saving ? "Saving..." : "Complete Setup"}
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="text-body hover:text-heading rounded-lg px-4 py-3 text-sm font-semibold transition"
                            >
                                Skip and save later
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
