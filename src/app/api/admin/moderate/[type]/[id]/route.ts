import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin Role Check
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (!['listing', 'profile'].includes(type)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body; 

    // action can be "suspend", "unsuspend", "make_unavailable", "make_available"
    if (type === 'profile') {
      const isSuspended = action === 'suspend';
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: isSuspended })
        .eq('id', id);
        
      if (error) throw error;
    } else if (type === 'listing') {
      const status = action === 'suspend' ? 'unavailable' : 'available';
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Moderate API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
