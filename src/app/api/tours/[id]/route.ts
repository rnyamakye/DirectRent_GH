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

    const { id: tourId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    // Fetch existing tour to verify permissions
    const { data: tour, error: fetchError } = await supabase
      .from("tour_requests")
      .select("id, agent_id, renter_id, status")
      .eq("id", tourId)
      .single();

    if (fetchError || !tour) {
      return NextResponse.json({ error: "Tour request not found" }, { status: 404 });
    }

    // Only allow renter or agent to update
    if (user.id !== tour.renter_id && user.id !== tour.agent_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status
    const { data: updatedTour, error: updateError } = await supabase
      .from("tour_requests")
      .update({ status })
      .eq("id", tourId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update tour:", updateError);
      return NextResponse.json({ error: "Failed to update tour" }, { status: 500 });
    }

    // Send notifications
    const { data: updaterProfile } = await supabase
      .from("profiles")
      .select("full_name, business_name")
      .eq("id", user.id)
      .single();

    const updaterName = updaterProfile?.business_name || updaterProfile?.full_name || "A user";
    const isAgent = user.id === tour.agent_id;

    if (status === "confirmed") {
      if (isAgent) {
        await sendNotification({
          userId: tour.renter_id,
          type: "account_updates",
          title: "Tour Confirmed",
          message: `${updaterName} has accepted your property tour request.`,
          link: "/renter/tours",
        });
      }
    } else if (status === "cancelled") {
      const recipientId = isAgent ? tour.renter_id : tour.agent_id;
      const recipientLink = isAgent ? "/renter/tours" : "/agent/tours";
      
      await sendNotification({
        userId: recipientId,
        type: "account_updates",
        title: "Tour Cancelled",
        message: `${updaterName} has cancelled the property tour.`,
        link: recipientLink,
      });
    }

    return NextResponse.json({ tour: updatedTour });
  } catch (err) {
    console.error("Update tour error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
