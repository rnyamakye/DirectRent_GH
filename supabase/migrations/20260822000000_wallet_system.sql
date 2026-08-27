-- Wallets Table
create table wallets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade unique,
    balance_pesewas bigint not null default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table wallets enable row level security;

create policy "Users can view own wallet"
    on wallets for select
    to authenticated
    using (auth.uid() = user_id);


-- Wallet Transactions Table
create table wallet_transactions (
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid not null references wallets(id) on delete cascade,
    type text not null check (type in ('credit', 'debit')),
    amount_pesewas bigint not null,
    reference text not null unique,
    description text,
    created_at timestamptz default now()
);

alter table wallet_transactions enable row level security;

create policy "Users can view own wallet transactions"
    on wallet_transactions for select
    to authenticated
    using (
        wallet_id in (select id from wallets where user_id = auth.uid())
    );


-- Payout Requests Table
create table payout_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    amount_pesewas bigint not null,
    payment_method_id uuid references payment_methods(id) on delete set null,
    status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table payout_requests enable row level security;

create policy "Users can view own payout requests"
    on payout_requests for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create own payout requests"
    on payout_requests for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Function to automatically create a wallet for new users, or we can create it lazily.
-- We will create wallets lazily or via a trigger.
create or replace function public.handle_new_user_wallet()
returns trigger as $$
begin
  insert into public.wallets (user_id, balance_pesewas)
  values (new.id, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_wallet
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_wallet();

-- Backfill wallets for existing profiles
insert into wallets (user_id, balance_pesewas)
select id, 0 from profiles on conflict do nothing;
