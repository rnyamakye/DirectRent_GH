import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

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

      await sendNotification({
        userId: id,
        type: "account_updates",
        title: isSuspended ? "Account Suspended" : "Account Reinstated",
        message: isSuspended 
          ? "Your account has been suspended by an administrator. Please contact support for more details." 
          : "Your account has been reinstated. You can now access all features.",
        link: "/help",
      });
    } else if (type === 'listing') {
      const status = action === 'suspend' ? 'unavailable' : 'available';
      
      // Need agent_id to notify them
      const { data: listing } = await supabase
        .from('listings')
        .select('agent_id, title')
        .eq('id', id)
        .single();
        
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      if (listing) {
        await sendNotification({
          userId: listing.agent_id,
          type: "account_updates",
          title: status === 'unavailable' ? "Listing Suspended" : "Listing Reinstated",
          message: status === 'unavailable'
            ? `Your listing "${listing.title}" has been suspended and made unavailable by an admin.`
            : `Your listing "${listing.title}" has been reinstated and is now available.`,
          link: `/agent/listings`,
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Moderate API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
