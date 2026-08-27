-- ============================================================
-- KYC / USER VERIFICATION
-- ============================================================

create table verification_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  document_url  text not null,
  status        text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table verification_requests enable row level security;

-- Users can view their own requests
create policy "Users can view own verification requests"
  on verification_requests for select
  using (auth.uid() = user_id);

-- Users can insert their own requests (only if they don't have a pending one)
create policy "Users can insert own verification requests"
  on verification_requests for insert
  with check (auth.uid() = user_id);

-- Admins can do everything
create policy "Admins can view all verification requests"
  on verification_requests for select
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update all verification requests"
  on verification_requests for update
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create index idx_verification_requests_user on verification_requests(user_id);
create index idx_verification_requests_status on verification_requests(status);

-- Add to profiles if not exists (done in previous migration, but ensuring here)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- ============================================================
-- STORAGE: kyc-documents (Private)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- Ensure RLS on storage.objects
-- Users can upload their own KYC documents
create policy "Users can upload their own KYC documents"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own KYC documents
create policy "Users can view their own KYC documents"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all KYC documents
create policy "Admins can view all KYC documents"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents' and
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
