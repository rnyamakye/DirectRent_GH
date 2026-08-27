-- Seed data for DirectRent
create extension if not exists pgcrypto;

-- ============================================================
-- AUTH USERS
-- ============================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values
('00000000-0000-0000-0000-000000000000', '83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'authenticated', 'authenticated', 'agent1@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kwame Properties","role":"agent","business_name":"Kwame Properties"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', 'b1a4a6b0-1cc2-97d4-677c-4ca6656e14d7', 'authenticated', 'authenticated', 'agent2@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Abena Real Estate","role":"agent","business_name":"Abena Real Estate"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '3eb3fdd0-1c42-e832-f9d5-a97934b19fad', 'authenticated', 'authenticated', 'artisan1@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yaw Electric","role":"artisan","business_name":"Yaw Electric"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '9a4cc346-9ed3-d492-7533-fda90bbc41cd', 'authenticated', 'authenticated', 'artisan2@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kojo Plumbing","role":"artisan","business_name":"Kojo Plumbing"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', 'authenticated', 'authenticated', 'renter1@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ama Student","role":"renter","business_name":"Ama Student"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', 'c2138be6-0b64-632d-51fb-03b675b555e2', 'authenticated', 'authenticated', 'renter2@test.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kofi Renter","role":"renter","business_name":"Kofi Renter"}', now(), now(), '', '', '', '', false);

-- ============================================================
-- PROFILES UPDATES
-- ============================================================

update public.profiles set phone = '0244000001' where id = '83a87fd7-56ab-5719-9c0b-b6d5e11168cb';
update public.profiles set phone = '0244000002' where id = 'b1a4a6b0-1cc2-97d4-677c-4ca6656e14d7';
update public.profiles set phone = '0244000003' where id = '3eb3fdd0-1c42-e832-f9d5-a97934b19fad';
update public.profiles set phone = '0244000004' where id = '9a4cc346-9ed3-d492-7533-fda90bbc41cd';
update public.profiles set phone = '0244000005' where id = 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc';
update public.profiles set phone = '0244000006' where id = 'c2138be6-0b64-632d-51fb-03b675b555e2';

-- ============================================================
-- ARTISAN PROFILES
-- ============================================================

insert into artisan_profiles (id, trade, service_area, bio, phone, services, availability) values
('3eb3fdd0-1c42-e832-f9d5-a97934b19fad', 'Electrician', 'Accra', 'Experienced Electrician with 10 years experience.', '0244000003', array['Service 1', 'Service 2'], 'available'),
('9a4cc346-9ed3-d492-7533-fda90bbc41cd', 'Plumber', 'Accra', 'Experienced Plumber with 10 years experience.', '0244000004', array['Service 1', 'Service 2'], 'available');

-- ============================================================
-- LISTINGS
-- ============================================================

insert into listings (id, agent_id, title, description, price, landmark, city, latitude, longitude, bedrooms, bathrooms, is_self_contained, has_shared_kitchen, has_shared_bathroom, photo_urls, status) values
('91d912f3-4738-2cc8-e3ea-d3ce82bd6746', '83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'Luxury Apartment East Legon', 'Beautiful property in Accra', 4500, 'East Legon', 'Accra', 5.6358, -0.1506, 2, 2, true, false, false, array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'], 'available'),
('1bffb56d-68f0-42be-c062-7343c5236279', '83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'Cozy Room in Cantonments', 'Beautiful property in Accra', 1500, 'Cantonments', 'Accra', 5.5891, -0.1691, 1, 1, true, false, false, array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'], 'available'),
('f1971333-3b41-d299-084c-a1aa03d8014b', 'b1a4a6b0-1cc2-97d4-677c-4ca6656e14d7', 'Student Hostel near KNUST', 'Beautiful property in Kumasi', 800, 'Ayeduase', 'Kumasi', 6.6731, -1.5674, 1, 0, false, true, true, array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'], 'available'),
('6f6d8633-90c8-7f9c-1a4e-5af2f6d955bb', 'b1a4a6b0-1cc2-97d4-677c-4ca6656e14d7', '2 Bedroom House in Adenta', 'Beautiful property in Accra', 2000, 'Adenta', 'Accra', 5.7171, -0.1654, 2, 1, true, false, false, array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'], 'available');

-- ============================================================
-- REVIEWS
-- ============================================================

insert into reviews (reviewer_id, target_type, target_id, rating, comment) values
('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', 'listing', '91d912f3-4738-2cc8-e3ea-d3ce82bd6746', 5, 'Great place to live!'),
('c2138be6-0b64-632d-51fb-03b675b555e2', 'artisan', '3eb3fdd0-1c42-e832-f9d5-a97934b19fad', 4, 'Very professional electrician.');

-- ============================================================
-- SAVED LISTINGS & PROFILES
-- ============================================================

insert into saved_listings (renter_id, listing_id) values ('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '91d912f3-4738-2cc8-e3ea-d3ce82bd6746');
insert into saved_profiles (renter_id, profile_id) values ('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '3eb3fdd0-1c42-e832-f9d5-a97934b19fad');

-- ============================================================
-- BOOST PAYMENTS
-- ============================================================

insert into boost_payments (owner_id, target_type, target_id, days, amount_pesewas, reference, status) values
('83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'listing', '91d912f3-4738-2cc8-e3ea-d3ce82bd6746', 7, 2000, 'TESTREF1', 'success');
update listings set boosted_until = now() + interval '7 days' where id = '91d912f3-4738-2cc8-e3ea-d3ce82bd6746';

-- ============================================================
-- MESSAGING
-- ============================================================

insert into conversations (id, participant_one_id, participant_two_id) values ('e8b3a7c3-3717-70f8-55a4-0e50a4323344', 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '83a87fd7-56ab-5719-9c0b-b6d5e11168cb');
insert into messages (conversation_id, sender_id, content) values ('e8b3a7c3-3717-70f8-55a4-0e50a4323344', 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', 'Is this listing still available?');

-- ============================================================
-- PROFILE VIEWS
-- ============================================================

insert into profile_views (target_id, viewer_id) values ('83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc');

-- ============================================================
-- BOOKINGS
-- ============================================================

insert into bookings (artisan_id, renter_id, booking_date, booking_time, location, status) values ('3eb3fdd0-1c42-e832-f9d5-a97934b19fad', 'bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', current_date + 2, '10:00:00', 'East Legon', 'pending');

-- ============================================================
-- IN-APP NOTIFICATIONS
-- ============================================================

insert into in_app_notifications (user_id, type, title, message) values ('83a87fd7-56ab-5719-9c0b-b6d5e11168cb', 'message', 'New Message', 'You have a new message from Ama Student.');

-- ============================================================
-- NEWSLETTER
-- ============================================================

insert into newsletter_subscribers (email) values ('test@newsletter.com');

-- ============================================================
-- RECENTLY VIEWED LISTINGS
-- ============================================================

insert into recently_viewed_listings (user_id, listing_id, viewed_at) values
('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '91d912f3-4738-2cc8-e3ea-d3ce82bd6746', now() - interval '10 minutes'),
('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '1bffb56d-68f0-42be-c062-7343c5236279', now() - interval '2 hours'),
('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', 'f1971333-3b41-d299-084c-a1aa03d8014b', now() - interval '1 day'),
('bdd700d0-62be-9eb1-3bf8-05a42c28cdfc', '6f6d8633-90c8-7f9c-1a4e-5af2f6d955bb', now() - interval '3 days');
