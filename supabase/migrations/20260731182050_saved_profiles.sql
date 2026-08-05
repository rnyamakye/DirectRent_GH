-- Migration: Add saved profiles (agents/artisans)
CREATE TABLE IF NOT EXISTS saved_profiles (
  renter_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (renter_id, profile_id)
);

ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'saved_profiles'
      AND policyname = 'Renters manage their own saved profiles'
  ) THEN
    CREATE POLICY "Renters manage their own saved profiles"
      ON saved_profiles FOR ALL USING (auth.uid() = renter_id);
  END IF;
END $$;

GRANT ALL ON saved_profiles TO anon, authenticated, service_role;
