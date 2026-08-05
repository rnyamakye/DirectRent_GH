-- Add public profile fields to the profiles table.
-- These fields power the renter's public-facing profile page and
-- the onboarding "Complete your profile" banner on the dashboard.
alter table profiles
  add column if not exists bio        text,
  add column if not exists location   text,
  add column if not exists occupation text,
  add column if not exists languages  text,
  add column if not exists fun_fact   text,
  add column if not exists interests  text[];
