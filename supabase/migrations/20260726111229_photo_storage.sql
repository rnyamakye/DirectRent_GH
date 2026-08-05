-- One shared bucket for all photo uploads (avatars, listing photos,
-- artisan photos). `public: true` means anyone can VIEW a file via
-- its URL with zero policy needed — only writes need policies below.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- storage.foldername(name) splits a file path like
-- "a1b2c3.../listing-1234-photo.jpg" into ["a1b2c3...", "listing-1234-photo.jpg"].
-- [1] is the first segment — requiring it to equal auth.uid() means
-- "you may only upload into a folder named after your own user id."
create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own photos"
  on storage.objects for update
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storing photo URLs as a plain text array — same pattern as
-- artisan_profiles.services, proportionate for "a handful of photo
-- URLs per listing," not complex enough to warrant a separate table.
alter table listings add column photo_urls text[];
alter table artisan_profiles add column photo_urls text[];