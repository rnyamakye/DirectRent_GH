import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, notes } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: request, error: updateError } = await supabase
      .from("verification_requests")
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !request) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    if (status === "approved") {
      // Update the user's profile to is_verified = true
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", request.user_id);

      if (profileError) {
        console.error("Failed to update profile verification status:", profileError);
      }
    } else if (status === "rejected") {
      // Set to false if rejected
      await supabase
        .from("profiles")
        .update({ is_verified: false })
        .eq("id", request.user_id);
    }

    return NextResponse.json({ request }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/admin/kyc error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
