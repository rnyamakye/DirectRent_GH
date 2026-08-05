-- Reviews could originally only target a listing or an artisan.
-- Widening this to also allow 'agent' — target_id will be the
-- agent's own profiles.id (same convention as artisan reviews, which
-- already point directly at profiles.id since artisans have no
-- separate id from their own user id).
alter table reviews drop constraint reviews_target_type_check;
alter table reviews add constraint reviews_target_type_check
  check (target_type in ('listing', 'artisan', 'agent'));