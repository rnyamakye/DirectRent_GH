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
    const { artisan_id, booking_date, booking_time, location, latitude, longitude } = body;

    if (!artisan_id || !booking_date || !booking_time || !location?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Prevent duplicate active bookings for the same artisan/renter
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("artisan_id", artisan_id)
      .eq("renter_id", user.id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active booking with this artisan" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        artisan_id,
        renter_id: user.id,
        booking_date,
        booking_time,
        location: location.trim(),
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Notify the artisan
    const { data: renterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const renterName = renterProfile?.full_name || "Someone";

    await sendNotification({
      userId: artisan_id,
      type: "artisan_messages", // We use artisan_messages for bookings as per preferences
      title: "New Booking Request",
      message: `${renterName} has requested a booking for ${booking_date} at ${booking_time}.`,
      link: "/artisan/dashboard",
    });

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

