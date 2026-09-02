import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { subject, html, secret } = await req.json();

    // Basic security to prevent unauthorized sending
    if (secret !== process.env.NEWSLETTER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!subject || !html) {
      return NextResponse.json(
        { error: "Subject and HTML content are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all active subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "subscribed");

    if (dbError) {
      console.error("Failed to fetch subscribers:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { message: "No active subscribers found" },
        { status: 200 }
      );
    }

    const emails = subscribers.map((sub) => sub.email);

    // Resend allows sending to up to 50 recipients per batch
    // For large lists, you would need to chunk this array and send in batches
    const { data, error } = await resend.emails.send({
      from: "DirectRent GH <onboarding@resend.dev>", // Using Resend testing email
      to: emails,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send emails" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Emails sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
