-- Migration: profile sub-settings fields + payment_methods table
-- Applied 2026-07-29 via docker psql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_name          text,
  ADD COLUMN IF NOT EXISTS phone                   text,
  ADD COLUMN IF NOT EXISTS residential_address     text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name  text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"new_listing_alerts":true,"saved_listing_updates":true,"review_notifications":true,"artisan_messages":true,"promotional_emails":false,"sms_alerts":false}'::jsonb;

CREATE TABLE IF NOT EXISTS payment_methods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('mobile_money','card')),
  label       text NOT NULL,
  last_four   text,
  provider    text,
  is_default  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment_methods'
      AND policyname = 'Users manage their own payment methods'
  ) THEN
    CREATE POLICY "Users manage their own payment methods"
      ON payment_methods FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT ALL ON payment_methods TO anon, authenticated, service_role;
