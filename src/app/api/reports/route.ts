import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Anonymous reports might be allowed, but usually we require authentication to prevent spam.
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { target_type, target_id, reason, details } = body;

    if (!target_type || !target_id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['listing', 'profile'].includes(target_type)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        target_type,
        target_id,
        reason,
        details,
        status: "pending"
      });

    if (insertError) {
      console.error("Report insertion error:", insertError);
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Report API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
