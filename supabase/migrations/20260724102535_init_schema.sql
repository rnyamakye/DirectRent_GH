create extension if not exists pgcrypto;

-- ============================================================
-- PROFILES — extends Supabase's auth.users with app-specific
-- fields. One row per signed-up user, whatever their role.
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text check (role in ('renter', 'agent', 'artisan')) default 'renter',
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up. Reads
-- full_name/role straight from the options.data you pass to
-- supabase.auth.signUp() on the Register page.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'renter')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LISTINGS — room listings.
-- ============================================================
create table listings (
  id             uuid primary key default gen_random_uuid(),
  agent_id       uuid not null references profiles(id) on delete cascade,
  title          text not null,
  description    text,
  price          numeric(12, 2) not null,
  landmark       text,
  status         text check (status in ('available', 'unavailable')) default 'available',
  boosted_until  timestamptz,
  created_at     timestamptz default now()
);

alter table listings enable row level security;

create policy "Listings are viewable by everyone"
  on listings for select
  using (true);

create policy "Agents manage their own listings"
  on listings for all
  using (auth.uid() = agent_id);

create index idx_listings_agent on listings(agent_id);

-- ============================================================
-- ARTISAN_PROFILES — one row per artisan, keyed directly by
-- their profiles.id (id IS the user id).
-- ============================================================
create table artisan_profiles (
  id             uuid primary key references profiles(id) on delete cascade,
  trade          text not null,
  service_area   text,
  bio            text,
  phone          text,
  services       text[],
  availability   text check (availability in ('available', 'busy')) default 'available',
  boosted_until  timestamptz,
  created_at     timestamptz default now()
);

alter table artisan_profiles enable row level security;

create policy "Artisan profiles are viewable by everyone"
  on artisan_profiles for select
  using (true);

create policy "Artisans manage their own profile"
  on artisan_profiles for all
  using (auth.uid() = id);

-- ============================================================
-- REVIEWS — shared table for reviews on listings and artisans,
-- distinguished by target_type/target_id.
-- ============================================================
create table reviews (
  id           uuid primary key default gen_random_uuid(),
  reviewer_id  uuid references profiles(id) on delete set null,
  target_type  text check (target_type in ('listing', 'artisan')) not null,
  target_id    uuid not null,
  rating       int check (rating between 1 and 5) not null,
  comment      text,
  created_at   timestamptz default now()
);

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Users manage their own reviews"
  on reviews for all
  using (auth.uid() = reviewer_id);

create index idx_reviews_target on reviews(target_type, target_id);

-- ============================================================
-- SAVED_LISTINGS — a renter's shortlist.
-- ============================================================
create table saved_listings (
  renter_id   uuid references profiles(id) on delete cascade,
  listing_id  uuid references listings(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (renter_id, listing_id)
);

alter table saved_listings enable row level security;

create policy "Renters manage their own saved listings"
  on saved_listings for all
  using (auth.uid() = renter_id);


-- ============================================================
-- GRANTS — Postgres requires baseline table access before RLS
-- policies are even evaluated. Without this, every query fails
-- with "permission denied", regardless of how permissive the
-- policies above are.
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Also apply automatically to any tables future migrations create,
-- so this doesn't need repeating every time.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;