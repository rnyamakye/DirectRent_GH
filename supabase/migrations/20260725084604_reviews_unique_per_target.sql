-- One review per person per target — re-submitting should edit their
-- existing review, not create a second one alongside it.
alter table reviews
  add constraint reviews_one_per_target unique (reviewer_id, target_type, target_id);