import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export type NotificationType = 
  | "new_listing_alerts"
  | "saved_listing_updates"
  | "review_notifications"
  | "artisan_messages"
  | "promotional_emails"
  | "sms_alerts"
  | "account_updates";

export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = await createClient();

  // 1. Fetch user's profile and notification preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, notification_preferences")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const prefs = profile.notification_preferences as Record<string, boolean>;
  const isEnabled = prefs?.[type] !== false; // Default to true if not explicitly false

  // 2. Insert In-App Notification (Always, if they haven't explicitly disabled the preference)
  if (isEnabled) {
    await supabaseAdmin.from("in_app_notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
    });
  }

  // 3. Send Email Notification (If enabled and email exists, and we have an API key)
  if (isEnabled && profile.email && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: "DirectRent GH <notifications@directrent.com>",
        to: profile.email,
        subject: title,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #032b23;">${title}</h2>
            <p style="color: #333; line-height: 1.5;">${message}</p>
            ${link ? `<a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #048261; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Details</a>` : ""}
            <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;" />
            <p style="color: #666; font-size: 12px;">
              You received this email because of your DirectRent GH notification preferences. 
              <br/>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/notifications" style="color: #048261;">Manage your preferences</a>.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
    }
  }
}
