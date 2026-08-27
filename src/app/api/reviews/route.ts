import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { target_type, target_id, rating, comment } = body;

    if (!target_type || !target_id || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: target_type, target_id, rating" },
        { status: 400 }
      );
    }

    if (!["listing", "agent", "artisan"].includes(target_type)) {
      return NextResponse.json(
        { error: "Invalid target_type" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // --- Validation: ensure the user actually completed a transaction ---
    if (target_type === "artisan") {
      // Must have a confirmed booking with this artisan
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("renter_id", user.id)
        .eq("artisan_id", target_id)
        .eq("status", "confirmed")
        .limit(1)
        .maybeSingle();

      if (!booking) {
        return NextResponse.json(
          { error: "You can only review an artisan after a confirmed booking." },
          { status: 403 }
        );
      }
    } else if (target_type === "agent") {
      // Must have a confirmed tour with this agent
      const { data: tour } = await supabase
        .from("tour_requests")
        .select("id")
        .eq("renter_id", user.id)
        .eq("agent_id", target_id)
        .eq("status", "confirmed")
        .limit(1)
        .maybeSingle();

      if (!tour) {
        return NextResponse.json(
          { error: "You can only review an agent after a confirmed tour." },
          { status: 403 }
        );
      }
    } else if (target_type === "listing") {
      // Must have a confirmed tour for this listing
      const { data: tour } = await supabase
        .from("tour_requests")
        .select("id")
        .eq("renter_id", user.id)
        .eq("listing_id", target_id)
        .eq("status", "confirmed")
        .limit(1)
        .maybeSingle();

      if (!tour) {
        return NextResponse.json(
          { error: "You can only review a listing after a confirmed tour." },
          { status: 403 }
        );
      }
    }

    // --- Upsert review (insert or update existing) ---
    const { data: review, error: upsertError } = await supabase
      .from("reviews")
      .upsert(
        {
          reviewer_id: user.id,
          target_type,
          target_id,
          rating,
          comment: comment || null,
        },
        { onConflict: "reviewer_id,target_type,target_id" }
      )
      .select("id, rating, comment, reviewer_id")
      .single();

    if (upsertError || !review) {
      console.error("Review upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save review." },
        { status: 500 }
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
