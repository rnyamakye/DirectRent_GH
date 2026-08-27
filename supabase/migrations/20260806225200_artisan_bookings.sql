create table public.bookings (
    id uuid not null default gen_random_uuid(),
    artisan_id uuid not null references public.artisan_profiles(id) on delete cascade,
    renter_id uuid not null references auth.users(id) on delete cascade,
    booking_date date not null,
    booking_time time not null,
    location text not null,
    status text not null default 'pending'
        check (status in ('pending', 'confirmed', 'cancelled')),
    created_at timestamp with time zone not null default now(),

    constraint bookings_pkey primary key (id)
);

alter table public.bookings enable row level security;

-- Authenticated users can create bookings for themselves
create policy "Renters can create bookings"
    on public.bookings for insert
    to authenticated
    with check (auth.uid() = renter_id);

-- Users can view bookings they are part of
create policy "Users can view own bookings"
    on public.bookings for select
    to authenticated
    using (auth.uid() = renter_id or auth.uid() = artisan_id);

-- Renters can update their own bookings (to cancel)
create policy "Renters can update own bookings"
    on public.bookings for update
    to authenticated
    using (auth.uid() = renter_id)
    with check (auth.uid() = renter_id);
