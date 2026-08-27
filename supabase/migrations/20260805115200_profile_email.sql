alter table profiles add column email text;

update profiles set email = auth.users.email
from auth.users
where profiles.id = auth.users.id;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, business_name, phone, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'phone',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;
