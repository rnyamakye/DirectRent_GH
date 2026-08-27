import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("support_messages")
      .insert([{ name, email, message, status: "pending" }]);

    if (error) {
      console.error("Support message error:", error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
