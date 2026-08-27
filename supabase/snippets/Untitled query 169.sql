create table public.tour_requests (
    id uuid not null default gen_random_uuid(),
    renter_id uuid not null references auth.users(id) on delete cascade,
    agent_id uuid not null references public.profiles(id) on delete cascade,
    listing_id uuid not null references public.listings(id) on delete cascade,
    tour_date date not null,
    tour_time time not null,
    tour_type text not null check (tour_type in ('physical', 'virtual')),
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
    created_at timestamp with time zone not null default now(),

    constraint tour_requests_pkey primary key (id)
);

alter table public.tour_requests enable row level security;

-- Authenticated users can create tour requests for themselves
create policy "Renters can create tour requests"
    on public.tour_requests for insert
    to authenticated
    with check (auth.uid() = renter_id);

-- Users can view tour requests they are part of
create policy "Users can view own tour requests"
    on public.tour_requests for select
    to authenticated
    using (auth.uid() = renter_id or auth.uid() = agent_id);

-- Renters can update their own tour requests (to cancel)
create policy "Renters can update own tour requests"
    on public.tour_requests for update
    to authenticated
    using (auth.uid() = renter_id)
    with check (auth.uid() = renter_id);

-- Agents can update their own tour requests (to accept/reject)
create policy "Agents can update own tour requests"
    on public.tour_requests for update
    to authenticated
    using (auth.uid() = agent_id)
    with check (auth.uid() = agent_id);
