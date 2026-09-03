import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, description, price, landmark, property_type, 
      bedrooms, bathrooms, is_self_contained, has_shared_kitchen, 
      has_shared_bathroom, status, photo_urls, city,
      latitude, longitude
    } = body;

    // 1. Insert the new listing
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        agent_id: user.id,
        title,
        description,
        price,
        landmark,
        property_type,
        bedrooms,
        bathrooms,
        is_self_contained,
        has_shared_kitchen,
        has_shared_bathroom,
        status,
        photo_urls,
        city,
        latitude,
        longitude
      })
      .select()
      .single();

    if (insertError) {
      console.error("Listing insert error:", insertError);
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }

    // 2. Alert Matching Logic
    // We only trigger alerts if the status is available
    if (status === "available") {
      // Build a query to find matching search alerts
      let query = supabase.from("search_alerts").select("renter_id");

      // Match city
      if (city) {
        query = query.or(`city.eq.${city},city.is.null`);
      }

      // Match property type
      if (property_type) {
        query = query.or(`property_type.eq.${property_type},property_type.is.null`);
      }

      // Match bedrooms
      if (bedrooms) {
        query = query.or(`bedrooms.lte.${bedrooms},bedrooms.is.null`);
      }

      // Match price range
      if (price) {
        query = query.or(`min_price.lte.${price},min_price.is.null`);
        query = query.or(`max_price.gte.${price},max_price.is.null`);
      }

      const { data: matchedAlerts, error: matchError } = await query;

      if (!matchError && matchedAlerts && matchedAlerts.length > 0) {
        // Prepare in-app notifications
        const notifications = matchedAlerts.map(alert => ({
          user_id: alert.renter_id,
          type: "new_listing_alerts",
          title: "New Match for Your Search!",
          message: `A new ${property_type} in ${city || landmark} matching your criteria was just listed for GHS ${price}.`,
          link: `/listings/${listing.id}`
        }));

        // Insert notifications
        const { error: notifyError } = await supabase
          .from("in_app_notifications")
          .insert(notifications);

        if (notifyError) {
          console.error("Failed to insert search alert notifications:", notifyError);
        }
      }
    }

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (err: any) {
    console.error("Create listing API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
