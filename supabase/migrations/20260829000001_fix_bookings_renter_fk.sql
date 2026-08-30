alter table public.bookings
drop constraint bookings_renter_id_fkey,
add constraint bookings_renter_id_fkey
  foreign key (renter_id)
  references public.profiles(id)
  on delete cascade;
