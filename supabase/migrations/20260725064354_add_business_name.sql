-- business_name only makes sense for agents, but keeping it as a
-- plain nullable column on `profiles` (rather than a separate table)
-- is proportionate here — it's one extra field, not a new concept.
alter table profiles add column business_name text;

-- Update the trigger to also capture business_name from signup
-- metadata, same as full_name/role already do.
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
    coalesce(new.raw_user_meta_data ->> 'role', 'renter'),
    new.raw_user_meta_data ->> 'business_name'
  );
  return new;
end;
$$;