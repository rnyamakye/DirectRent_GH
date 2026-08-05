-- Previously this trigger defaulted role to 'renter' whenever
-- raw_user_meta_data had no 'role' key — which was ALWAYS true for
-- OAuth signups (Google has no way to send our custom role field),
-- silently locking every Google sign-up into "renter" forever.
-- Removing the fallback: OAuth signups now get role = NULL, which we
-- can detect and prompt for, instead of guessing wrong.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, business_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'business_name'
  );
  return new;
end;
$$;