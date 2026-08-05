create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one_id uuid not null references profiles(id) on delete cascade,
  participant_two_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  unique (participant_one_id, participant_two_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text,
  photo_url text,
  created_at timestamptz default now(),
  read_at timestamptz
);

alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Participants can view their conversations"
  on conversations for select
  using (auth.uid() = participant_one_id or auth.uid() = participant_two_id);

create policy "Users can create conversations they're part of"
  on conversations for insert
  with check (auth.uid() = participant_one_id or auth.uid() = participant_two_id);

create policy "Participants can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant_one_id = auth.uid() or c.participant_two_id = auth.uid())
    )
  );

create policy "Participants can send messages in their conversations"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant_one_id = auth.uid() or c.participant_two_id = auth.uid())
    )
  );

create policy "Participants can mark messages read"
  on messages for update
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant_one_id = auth.uid() or c.participant_two_id = auth.uid())
    )
  );

-- Enforces the scope decision directly in the database: a
-- conversation can only exist between a renter and an agent, or a
-- renter and an artisan — never renter+renter, agent+agent, or
-- agent+artisan. Checked here, not just in the UI, so it can't be
-- bypassed by calling the insert directly.
create or replace function enforce_conversation_role_pair()
returns trigger as $$
declare
  role_one text;
  role_two text;
begin
  select role into role_one from profiles where id = new.participant_one_id;
  select role into role_two from profiles where id = new.participant_two_id;

  if not (
    (role_one = 'renter' and role_two in ('agent', 'artisan'))
    or (role_two = 'renter' and role_one in ('agent', 'artisan'))
  ) then
    raise exception 'Conversations are only allowed between a renter and an agent or artisan.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger check_conversation_role_pair
before insert on conversations
for each row execute function enforce_conversation_role_pair();

-- Keeps the conversation list orderable by recency automatically,
-- without a second client-side write every time a message is sent.
create or replace function update_conversation_last_message()
returns trigger as $$
begin
  update conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger set_conversation_last_message
after insert on messages
for each row execute function update_conversation_last_message();

-- Realtime only pushes changes for tables explicitly added to this
-- publication — without this line, the live chat subscription would
-- silently receive nothing, with no error to point at why.
alter publication supabase_realtime add table messages;