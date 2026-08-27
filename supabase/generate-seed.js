const crypto = require("crypto");
const fs = require("fs");

function genUUID(seed) {
  // deterministic uuid for a given string
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const agents = [
  { id: genUUID('agent1'), email: 'agent1@test.com', name: 'Kwame Properties', role: 'agent', phone: '0244000001', verified: true },
  { id: genUUID('agent2'), email: 'agent2@test.com', name: 'Abena Real Estate', role: 'agent', phone: '0244000002', verified: false }
];

const artisans = [
  { id: genUUID('artisan1'), email: 'artisan1@test.com', name: 'Yaw Electric', role: 'artisan', phone: '0244000003', trade: 'Electrician', verified: true },
  { id: genUUID('artisan2'), email: 'artisan2@test.com', name: 'Kojo Plumbing', role: 'artisan', phone: '0244000004', trade: 'Plumber', verified: false }
];

const renters = [
  { id: genUUID('renter1'), email: 'renter1@test.com', name: 'Ama Student', role: 'renter', phone: '0244000005', verified: false },
  { id: genUUID('renter2'), email: 'renter2@test.com', name: 'Kofi Renter', role: 'renter', phone: '0244000006', verified: true }
];

const users = [...agents, ...artisans, ...renters];

let sql = `-- Seed data for DirectRent\ncreate extension if not exists pgcrypto;\n\n`;
sql += `-- ============================================================\n-- AUTH USERS\n-- ============================================================\n\n`;
sql += `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values\n`;

const userValues = users.map(u => `('00000000-0000-0000-0000-000000000000', '${u.id}', 'authenticated', 'authenticated', '${u.email}', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"${u.name}","role":"${u.role}","business_name":"${u.name}"}', now(), now(), '', '', '', '', false)`);

sql += userValues.join(",\n") + ";\n\n";

sql += `-- ============================================================\n-- PROFILES UPDATES\n-- ============================================================\n\n`;
users.forEach(u => {
  sql += `update public.profiles set phone = '${u.phone}' where id = '${u.id}';\n`;
});

sql += `\n-- ============================================================\n-- ARTISAN PROFILES\n-- ============================================================\n\n`;
sql += `insert into artisan_profiles (id, trade, service_area, bio, phone, services, availability) values\n`;
const artisanValues = artisans.map(a => `('${a.id}', '${a.trade}', 'Accra', 'Experienced ${a.trade} with 10 years experience.', '${a.phone}', array['Service 1', 'Service 2'], 'available')`);
sql += artisanValues.join(",\n") + ";\n\n";

sql += `-- ============================================================\n-- LISTINGS\n-- ============================================================\n\n`;
const listings = [
  { id: genUUID('listing1'), agent: agents[0].id, title: 'Luxury Apartment East Legon', price: 4500, landmark: 'East Legon', city: 'Accra', lat: 5.6358, lng: -0.1506, bed: 2, bath: 2, self: true, kitchen: false, shared_bath: false },
  { id: genUUID('listing2'), agent: agents[0].id, title: 'Cozy Room in Cantonments', price: 1500, landmark: 'Cantonments', city: 'Accra', lat: 5.5891, lng: -0.1691, bed: 1, bath: 1, self: true, kitchen: false, shared_bath: false },
  { id: genUUID('listing3'), agent: agents[1].id, title: 'Student Hostel near KNUST', price: 800, landmark: 'Ayeduase', city: 'Kumasi', lat: 6.6731, lng: -1.5674, bed: 1, bath: 0, self: false, kitchen: true, shared_bath: true },
  { id: genUUID('listing4'), agent: agents[1].id, title: '2 Bedroom House in Adenta', price: 2000, landmark: 'Adenta', city: 'Accra', lat: 5.7171, lng: -0.1654, bed: 2, bath: 1, self: true, kitchen: false, shared_bath: false }
];

sql += `insert into listings (id, agent_id, title, description, price, landmark, city, latitude, longitude, bedrooms, bathrooms, is_self_contained, has_shared_kitchen, has_shared_bathroom, photo_urls, status) values\n`;
const listingValues = listings.map(l => `('${l.id}', '${l.agent}', '${l.title}', 'Beautiful property in ${l.city}', ${l.price}, '${l.landmark}', '${l.city}', ${l.lat}, ${l.lng}, ${l.bed}, ${l.bath}, ${l.self}, ${l.kitchen}, ${l.shared_bath}, array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'], 'available')`);
sql += listingValues.join(",\n") + ";\n\n";

sql += `-- ============================================================\n-- REVIEWS\n-- ============================================================\n\n`;
sql += `insert into reviews (reviewer_id, target_type, target_id, rating, comment) values\n`;
sql += `('${renters[0].id}', 'listing', '${listings[0].id}', 5, 'Great place to live!'),\n`;
sql += `('${renters[1].id}', 'artisan', '${artisans[0].id}', 4, 'Very professional electrician.');\n\n`;

sql += `-- ============================================================\n-- SAVED LISTINGS & PROFILES\n-- ============================================================\n\n`;
sql += `insert into saved_listings (renter_id, listing_id) values ('${renters[0].id}', '${listings[0].id}');\n`;
sql += `insert into saved_profiles (renter_id, profile_id) values ('${renters[0].id}', '${artisans[0].id}');\n\n`;

sql += `-- ============================================================\n-- BOOST PAYMENTS\n-- ============================================================\n\n`;
sql += `insert into boost_payments (owner_id, target_type, target_id, days, amount_pesewas, reference, status) values\n`;
sql += `('${agents[0].id}', 'listing', '${listings[0].id}', 7, 2000, 'TESTREF1', 'success');\n`;
sql += `update listings set boosted_until = now() + interval '7 days' where id = '${listings[0].id}';\n\n`;

sql += `-- ============================================================\n-- MESSAGING\n-- ============================================================\n\n`;
sql += `insert into conversations (id, participant_one_id, participant_two_id) values ('${genUUID('conv1')}', '${renters[0].id}', '${agents[0].id}');\n`;
sql += `insert into messages (conversation_id, sender_id, content) values ('${genUUID('conv1')}', '${renters[0].id}', 'Is this listing still available?');\n\n`;

sql += `-- ============================================================\n-- PROFILE VIEWS\n-- ============================================================\n\n`;
sql += `insert into profile_views (target_id, viewer_id) values ('${agents[0].id}', '${renters[0].id}');\n\n`;

sql += `-- ============================================================\n-- BOOKINGS\n-- ============================================================\n\n`;
sql += `insert into bookings (artisan_id, renter_id, booking_date, booking_time, location, status) values ('${artisans[0].id}', '${renters[0].id}', current_date + 2, '10:00:00', 'East Legon', 'pending');\n\n`;

sql += `-- ============================================================\n-- IN-APP NOTIFICATIONS\n-- ============================================================\n\n`;
sql += `insert into in_app_notifications (user_id, type, title, message) values ('${agents[0].id}', 'message', 'New Message', 'You have a new message from Ama Student.');\n\n`;

sql += `-- ============================================================\n-- NEWSLETTER\n-- ============================================================\n\n`;
sql += `insert into newsletter_subscribers (email) values ('test@newsletter.com');\n\n`;

fs.writeFileSync("supabase/seed.sql", sql);
console.log("seed.sql generated successfully!");
