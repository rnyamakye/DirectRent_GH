alter table public.bookings 
add column amount_pesewas bigint default 0,
add column payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded'));

-- Booking Payments Tracking
create table booking_payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references bookings(id) on delete cascade,
    renter_id uuid not null references auth.users(id) on delete cascade,
    amount_pesewas bigint not null,
    reference text unique not null,
    status text check (status in ('pending', 'success', 'failed')) default 'pending',
    created_at timestamptz default now()
);

alter table booking_payments enable row level security;

create policy "Renters can manage their booking payments"
    on booking_payments for all
    to authenticated
    using (auth.uid() = renter_id);

