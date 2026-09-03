-- Seed data for DirectRent
create extension if not exists pgcrypto;

-- ============================================================
-- AUTH USERS
-- ============================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","role":"renter","avatar_url": "https://randomuser.me/api/portraits/lego/1.jpg"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'agent1@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kofi Owusu","role":"agent","business_name":"Kofi Owusu", "avatar_url": "https://randomuser.me/api/portraits/women/2.jpg"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'agent2@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kojo Asamoah","role":"agent","business_name":"Kojo Asamoah", "avatar_url": "https://randomuser.me/api/portraits/men/3.jpg"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'artisan1@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mary Quaye","role":"artisan","business_name":"Mary Quaye", "avatar_url": "https://randomuser.me/api/portraits/women/42.jpg"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'artisan2@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Grace Mensah","role":"artisan","business_name":"Grace Mensah", "avatar_url": "https://randomuser.me/api/portraits/men/43.jpg"}', now(), now(), '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'renter1@directrent.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Samuel Agyemang","role":"renter","business_name":"Samuel Agyemang", "avatar_url": "https://randomuser.me/api/portraits/men/82.jpg"}', now(), now(), '', '', '', '', false);

-- ============================================================
-- PROFILES UPDATES
-- ============================================================

update public.profiles set phone = '0244000000', avatar_url = 'https://randomuser.me/api/portraits/lego/1.jpg', is_admin = true where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set phone = '0244000001', avatar_url = 'https://randomuser.me/api/portraits/women/2.jpg' where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set phone = '0244000002', avatar_url = 'https://randomuser.me/api/portraits/men/3.jpg' where id = '33333333-3333-3333-3333-333333333333';
update public.profiles set phone = '0245000001', avatar_url = 'https://randomuser.me/api/portraits/women/42.jpg' where id = '44444444-4444-4444-4444-444444444444';
update public.profiles set phone = '0245000002', avatar_url = 'https://randomuser.me/api/portraits/men/43.jpg' where id = '55555555-5555-5555-5555-555555555555';
update public.profiles set phone = '0246000001', avatar_url = 'https://randomuser.me/api/portraits/men/82.jpg' where id = '66666666-6666-6666-6666-666666666666';

-- ============================================================
-- ARTISAN PROFILES
-- ============================================================

insert into artisan_profiles (id, trade, service_area, bio, phone, services, availability) values
('44444444-4444-4444-4444-444444444444', 'Plumber', 'Accra', 'Experienced Plumber offering premium services.', '0245000001', array['Service 1', 'Service 2'], 'available'),
('55555555-5555-5555-5555-555555555555', 'Carpenter', 'Accra', 'Experienced Carpenter offering premium services.', '0245000002', array['Service 1', 'Service 2'], 'available');

-- ============================================================
-- LISTINGS
-- ============================================================

insert into listings (id, agent_id, title, description, price, landmark, city, latitude, longitude, bedrooms, bathrooms, is_self_contained, has_shared_kitchen, has_shared_bathroom, photo_urls, status) values
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Spacious Self Contained Apartment', 'A highly desirable 2 bedroom space.', 850.00, 'East Legon', 'Accra', 5.6358, -0.1554, 2, 2, true, false, false, array['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000'], 'available'),
('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'Modern Studio Near University', 'Perfect for students.', 500.00, 'Legon Campus Area', 'Accra', 5.6508, -0.1864, 1, 1, true, false, false, array['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1502672260266-1c1c2c310c14?auto=format&fit=crop&q=80&w=1000'], 'available');

-- ============================================================
-- REVIEWS
-- ============================================================

insert into reviews (reviewer_id, target_type, target_id, rating, comment) values
('66666666-6666-6666-6666-666666666666', 'listing', '77777777-7777-7777-7777-777777777777', 5, 'Great place, loved it!'),
('66666666-6666-6666-6666-666666666666', 'artisan', '44444444-4444-4444-4444-444444444444', 4, 'Very professional plumber.');

-- ============================================================
-- BOOKINGS & OTHERS
-- ============================================================

insert into saved_listings (renter_id, listing_id) values ('66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777');
insert into saved_profiles (renter_id, profile_id) values ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444');

insert into boost_payments (owner_id, target_type, target_id, days, amount_pesewas, reference, status) values
('22222222-2222-2222-2222-222222222222', 'listing', '77777777-7777-7777-7777-777777777777', 7, 5000, 'REF-777-111', 'success');

insert into conversations (id, participant_one_id, participant_two_id) values ('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222');
insert into messages (conversation_id, sender_id, content) values ('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'Is this listing still available?');

insert into profile_views (target_id, viewer_id) values ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666');

insert into bookings (artisan_id, renter_id, booking_date, booking_time, location, status) values 
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', current_date + 2, '10:00:00', 'East Legon', 'pending');

insert into in_app_notifications (user_id, type, title, message) values ('22222222-2222-2222-2222-222222222222', 'message', 'New Message', 'You have a new message from Samuel Agyemang.');

insert into newsletter_subscribers (email) values ('test@newsletter.com');
