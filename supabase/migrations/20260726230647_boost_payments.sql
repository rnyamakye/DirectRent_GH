-- Tracks every boost payment attempt — needed so the callback route
-- can verify "does this reference actually belong to a real pending
-- payment I created," not just trust whatever comes back in the URL.
create table boost_payments (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  target_type     text check (target_type in ('listing', 'artisan')) not null,
  target_id       uuid not null,
  days            int not null,
  amount_pesewas  int not null,
  reference       text unique not null,
  status          text check (status in ('pending', 'success', 'failed')) default 'pending',
  created_at      timestamptz default now()
);

alter table boost_payments enable row level security;

create policy "Users manage their own boost payments"
  on boost_payments for all
  using (auth.uid() = owner_id);