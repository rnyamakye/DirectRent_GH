import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { document_url } = await req.json();

    if (!document_url) {
      return NextResponse.json({ error: "Missing document_url" }, { status: 400 });
    }

    // Check if there is already a pending request
    const { data: existingRequest } = await supabase
      .from("verification_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending verification request." },
        { status: 400 }
      );
    }

    // Check if the user is already verified
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("id", user.id)
      .single();
      
    if (profile?.is_verified) {
      return NextResponse.json(
        { error: "Your profile is already verified." },
        { status: 400 }
      );
    }

    const { data: request, error } = await supabase
      .from("verification_requests")
      .insert({
        user_id: user.id,
        document_url,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating KYC request:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/kyc error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
