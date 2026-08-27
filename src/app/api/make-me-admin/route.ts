import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// IMPORTANT: This route is strictly for initial setup/testing
// and should be deleted in production!
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: "You are now an admin! Please delete this route in production." 
    }, { status: 200 });
  } catch (err: any) {
    console.error("Make me admin error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
