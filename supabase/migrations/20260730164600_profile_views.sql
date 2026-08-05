create table public.profile_views (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references public.profiles(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profile_views enable row level security;

create policy "Anyone can insert a view"
  on public.profile_views for insert
  with check (true);

create policy "Users can view their own profile views"
  on public.profile_views for select
  using (auth.uid() = target_id);
