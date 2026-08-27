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
    const { city, property_type, min_price, max_price, bedrooms } = body;

    const { data, error } = await supabase
      .from("search_alerts")
      .insert({
        renter_id: user.id,
        city: city || null,
        property_type: property_type || null,
        min_price: min_price ? Number(min_price) : null,
        max_price: max_price ? Number(max_price) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert alert error:", error);
      return NextResponse.json({ error: "Failed to save search alert" }, { status: 500 });
    }

    return NextResponse.json({ success: true, alert: data }, { status: 201 });
  } catch (err: any) {
    console.error("Alerts API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
