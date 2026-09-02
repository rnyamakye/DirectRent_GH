"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function HeartSaveButton({
  targetId,
  saveType = "listing",
  initialSaved = false,
  isLoggedIn = false,
}: {
  targetId: string | number;
  saveType?: "listing" | "profile";
  initialSaved?: boolean;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/auth/login?returnTo=/listings`);
      return;
    }

    if (pending) return;
    setPending(true);

    // Optimistic UI update
    const newValue = !saved;
    setSaved(newValue);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaved(saved); // revert
      setPending(false);
      return;
    }

    if (!newValue) {
      // Was saved, now unsaved
      if (saveType === "listing") {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("renter_id", user.id)
          .eq("listing_id", targetId);
      } else {
        await supabase
          .from("saved_profiles")
          .delete()
          .eq("renter_id", user.id)
          .eq("profile_id", targetId);
      }
    } else {
      if (saveType === "listing") {
        await supabase.from("saved_listings").insert({
          renter_id: user.id,
          listing_id: targetId,
        });
      } else {
        await supabase.from("saved_profiles").insert({
          renter_id: user.id,
          profile_id: targetId,
        });
      }
    }

    setPending(false);
  }

  return (
    <button
      onClick={toggleSave}
      aria-label={saved ? "Unsave" : "Save"}
      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card/80 text-heading backdrop-blur transition hover:scale-110 z-10"
    >
      <svg
        className={`h-4 w-4 transition ${
          saved ? "fill-primary text-primary" : "fill-none"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
