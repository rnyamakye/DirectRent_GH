-- Recently viewed listings table
create table if not exists recently_viewed_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  viewed_at timestamptz default now() not null,
  unique (user_id, listing_id)
);

-- Index for fast lookups by user, ordered by most recent
create index idx_recently_viewed_user on recently_viewed_listings (user_id, viewed_at desc);

-- RLS
alter table recently_viewed_listings enable row level security;

-- Users can read their own recently viewed listings
create policy "Users can view own recently viewed"
  on recently_viewed_listings for select
  using (auth.uid() = user_id);

-- Users can insert their own views
create policy "Users can insert own views"
  on recently_viewed_listings for insert
  with check (auth.uid() = user_id);

-- Users can update their own views (for upsert / refreshing viewed_at)
create policy "Users can update own views"
  on recently_viewed_listings for update
  using (auth.uid() = user_id);

-- Users can delete their own views
create policy "Users can delete own views"
  on recently_viewed_listings for delete
  using (auth.uid() = user_id);
