-- Add 'pending_payment' to listings status
alter table listings drop constraint listings_status_check;
alter table listings add constraint listings_status_check check (status in ('available', 'unavailable', 'pending_payment'));

-- Tracks every listing payment attempt — needed so the callback route
-- can verify "does this reference actually belong to a real pending
-- payment I created," not just trust whatever comes back in the URL.
create table listing_payments (
  id              uuid primary key default gen_random_uuid(),
  agent_id        uuid not null references profiles(id) on delete cascade,
  listing_id      uuid not null references listings(id) on delete cascade,
  amount_pesewas  int not null,
  reference       text unique not null,
  status          text check (status in ('pending', 'success', 'failed')) default 'pending',
  created_at      timestamptz default now()
);

alter table listing_payments enable row level security;

create policy "Agents manage their own listing payments"
  on listing_payments for all
  using (auth.uid() = agent_id);
