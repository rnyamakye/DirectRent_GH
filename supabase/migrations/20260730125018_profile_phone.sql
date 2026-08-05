-- The phone column already exists from init_schema.sql and profile_settings.sql

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, business_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;