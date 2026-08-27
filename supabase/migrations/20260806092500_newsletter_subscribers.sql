create table public.newsletter_subscribers (
    id uuid not null default gen_random_uuid(),
    email text not null unique,
    created_at timestamp with time zone not null default now(),

    constraint newsletter_subscribers_pkey primary key (id)
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can insert newsletter subscribers" on public.newsletter_subscribers
    for insert to public
    with check (true);
