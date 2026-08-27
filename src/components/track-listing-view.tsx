"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Invisible client component that records a listing view for the current user.
 * Drop it anywhere inside the listing detail page — it renders nothing.
 */
export function TrackListingView({ listingId }: { listingId: string }) {
  useEffect(() => {
    const supabase = createClient();

    async function record() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Upsert: insert if new, update viewed_at if already exists
      await supabase.from("recently_viewed_listings").upsert(
        {
          user_id: user.id,
          listing_id: listingId,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,listing_id" }
      );
    }

    record();
  }, [listingId]);

  return null;
}
