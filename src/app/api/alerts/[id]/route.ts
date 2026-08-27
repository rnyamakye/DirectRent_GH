import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("search_alerts")
      .delete()
      .eq("id", id)
      .eq("renter_id", user.id); // RLS handles this, but good to be explicit

    if (error) {
      console.error("Delete alert error:", error);
      return NextResponse.json({ error: "Failed to delete search alert" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Alerts DELETE API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
