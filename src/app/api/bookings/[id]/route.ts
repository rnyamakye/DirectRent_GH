import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["confirmed", "cancelled", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    // Fetch existing booking to verify permissions
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, artisan_id, renter_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only allow renter or artisan to update
    if (user.id !== booking.renter_id && user.id !== booking.artisan_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // Send notifications
    const { data: updaterProfile } = await supabase
      .from("profiles")
      .select("full_name, business_name, role")
      .eq("id", user.id)
      .single();

    const updaterName = updaterProfile?.business_name || updaterProfile?.full_name || "A user";
    const isArtisan = user.id === booking.artisan_id;

    if (status === "confirmed") {
      if (isArtisan) {
        await sendNotification({
          userId: booking.renter_id,
          type: "account_updates",
          title: "Booking Confirmed",
          message: `${updaterName} has accepted your booking request.`,
          link: "/renter/bookings",
        });
      }
    } else if (status === "completed") {
      if (isArtisan) {
        await sendNotification({
          userId: booking.renter_id,
          type: "account_updates",
          title: "Booking Completed",
          message: `${updaterName} has marked your booking as completed.`,
          link: "/renter/bookings",
        });
      }
    } else if (status === "cancelled") {
      const recipientId = isArtisan ? booking.renter_id : booking.artisan_id;
      const recipientLink = isArtisan ? "/renter/bookings" : "/artisan/overview";
      
      await sendNotification({
        userId: recipientId,
        type: "account_updates",
        title: "Booking Cancelled",
        message: `${updaterName} has cancelled the booking.`,
        link: recipientLink,
      });
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (err) {
    console.error("Update booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
