-- Update the handle_new_user trigger to capture the avatar_url or picture from OAuth providers (like Google)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, business_name, phone, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Sync avatar on sign in if the user does not have one
create or replace function sync_user_avatar()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'avatar_url' is not null or new.raw_user_meta_data->>'picture' is not null then
    update public.profiles
    set avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
    where id = new.id and (avatar_url is null or avatar_url = '');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  -- only trigger if the metadata actually changed
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute procedure sync_user_avatar();
