"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SaveButton({
    listingId,
    initialSaved,
    isLoggedIn,
}: {
    listingId: string;
    initialSaved: boolean;
    isLoggedIn: boolean;
}) {
    const router = useRouter();
    const [saved, setSaved] = useState(initialSaved);
    const [pending, setPending] = useState(false);

    async function handleToggle() {
        if (!isLoggedIn) {
            router.push(`/auth/login?returnTo=/listings/${listingId}`);
            return;
        }

        setPending(true);
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setPending(false);
            return;
        }

        if (saved) {
            await supabase
                .from("saved_listings")
                .delete()
                .eq("renter_id", user.id)
                .eq("listing_id", listingId);
            setSaved(false);
        } else {
            await supabase.from("saved_listings").insert({
                renter_id: user.id,
                listing_id: listingId,
            });
            setSaved(true);
        }

        setPending(false);
    }

    return (
        <button
            onClick={handleToggle}
            disabled={pending}
            className="border border-border text-heading rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
            {saved ? "Saved ✓" : "Save listing"}
        </button>
    );
}