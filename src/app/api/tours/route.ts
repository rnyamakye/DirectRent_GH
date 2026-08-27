import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listing_id, agent_id, tour_date, tour_time, tour_type } = body;

    if (!listing_id || !agent_id || !tour_date || !tour_time || !tour_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert tour request
    const { data: tourRequest, error } = await supabase
      .from("tour_requests")
      .insert({
        renter_id: user.id,
        listing_id,
        agent_id,
        tour_date,
        tour_time,
        tour_type,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create tour request:", error);
      return NextResponse.json(
        { error: "Failed to create tour request" },
        { status: 500 }
      );
    }

    // Send notification to the agent
    const { data: renterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const renterName = renterProfile?.full_name || "A renter";

    await sendNotification({
      userId: agent_id,
      type: "account_updates",
      title: "New Tour Request",
      message: `${renterName} has requested a ${tour_type} tour for your listing.`,
      link: "/agent/tours",
    });

    return NextResponse.json({ tour: tourRequest }, { status: 201 });
  } catch (err) {
    console.error("Create tour error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
