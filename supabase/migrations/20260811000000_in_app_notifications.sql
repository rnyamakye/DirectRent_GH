-- Migration: in_app_notifications
-- Applied via antigravity

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  link        text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notifications"
  ON in_app_notifications FOR ALL USING (auth.uid() = user_id);

-- Make sure Realtime is enabled for the notifications table so the bell can update
alter publication supabase_realtime add table in_app_notifications;

GRANT ALL ON in_app_notifications TO anon, authenticated, service_role;
