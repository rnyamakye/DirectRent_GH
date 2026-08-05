-- Enable Supabase Realtime on the profiles table so that client-side
-- subscriptions (e.g. the header avatar) receive live UPDATE events
-- immediately after a profile save, without a page reload.
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
