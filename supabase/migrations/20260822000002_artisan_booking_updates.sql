-- Artisans can update their own bookings (to accept/reject)
create policy "Artisans can update own bookings"
    on public.bookings for update
    to authenticated
    using (auth.uid() = artisan_id)
    with check (auth.uid() = artisan_id);
