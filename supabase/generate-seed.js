const crypto = require("crypto");
const fs = require("fs");

function genUUID(seed) {
  // deterministic uuid for a given string
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const firstNames = ["Kwame", "Kofi", "Kojo", "Yaw", "Kwabena", "Kwaku", "Akwasi", "Ama", "Abena", "Akosua", "Adwoa", "Yaa", "Afia", "Esi", "Emelia", "Samuel", "Emanuel", "Joseph", "David", "Mary", "Grace", "Sarah"];
const lastNames = ["Mensah", "Osei", "Owusu", "Appiah", "Asamoah", "Addo", "Boakye", "Ofori", "Yeboah", "Agyemang", "Tetteh", "Baah", "Danquah", "Gyasi", "Boateng", "Quaye", "Acheampong", "Nkrumah"];
const agencies = ["Properties", "Real Estate", "Estates", "Homes", "Realty", "Consult", "Shelter"];

function getRandomName(i) {
  const f = firstNames[i % firstNames.length];
  const l = lastNames[(i * 3) % lastNames.length];
  return `${f} ${l}`;
}

function getRandomAvatar(i, genderPreference = null) {
  // Use randomuser.me for high quality realistic portraits
  const gender = genderPreference || (i % 2 === 0 ? 'men' : 'women');
  const num = (i % 99) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
}

const agents = [];
for (let i = 1; i <= 37; i++) {
  const f = firstNames[i % firstNames.length];
  const l = lastNames[(i * 2) % lastNames.length];
  const a = agencies[i % agencies.length];
  const isCompany = i % 3 === 0;
  const name = isCompany ? `${f} ${l} ${a}` : `${f} ${l}`;
  agents.push({
    id: genUUID(`agent${i}`),
    email: `agent${i}@directrent.test`,
    name: name,
    role: 'agent',
    phone: `0244${i.toString().padStart(6, '0')}`,
    avatar: getRandomAvatar(i, isCompany ? 'men' : null), 
    verified: i % 2 === 0
  });
}

const trades = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason', 'AC Repair', 'Cleaner'];
const artisans = [];
for (let i = 1; i <= 27; i++) {
  artisans.push({
    id: genUUID(`artisan${i}`),
    email: `artisan${i}@directrent.test`,
    name: getRandomName(i + 40),
    role: 'artisan',
    phone: `0245${i.toString().padStart(6, '0')}`,
    trade: trades[i % trades.length],
    avatar: getRandomAvatar(i + 40),
    verified: i % 3 === 0
  });
}

const renters = [];
for (let i = 1; i <= 17; i++) {
  renters.push({
    id: genUUID(`renter${i}`),
    email: `renter${i}@directrent.test`,
    name: getRandomName(i + 80),
    role: 'renter',
    phone: `0246${i.toString().padStart(6, '0')}`,
    avatar: getRandomAvatar(i + 80),
    verified: true
  });
}

const users = [...agents, ...artisans, ...renters];

let sql = `-- Seed data for DirectRent\ncreate extension if not exists pgcrypto;\n\n`;
sql += `-- ============================================================\n-- AUTH USERS\n-- ============================================================\n\n`;
sql += `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values\n`;

const userValues = users.map(u => `('00000000-0000-0000-0000-000000000000', '${u.id}', 'authenticated', 'authenticated', '${u.email}', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"${u.name}","role":"${u.role}","business_name":"${u.name}", "avatar_url": "${u.avatar}"}', now(), now(), '', '', '', '', false)`);

sql += userValues.join(",\n") + ";\n\n";

sql += `-- ============================================================\n-- PROFILES UPDATES\n-- ============================================================\n\n`;
users.forEach(u => {
  sql += `update public.profiles set phone = '${u.phone}', avatar_url = '${u.avatar}' where id = '${u.id}';\n`;
});

sql += `\n-- ============================================================\n-- ARTISAN PROFILES\n-- ============================================================\n\n`;
sql += `insert into artisan_profiles (id, trade, service_area, bio, phone, services, availability) values\n`;
const artisanValues = artisans.map(a => `('${a.id}', '${a.trade}', 'Accra', 'Experienced ${a.trade} offering premium services.', '${a.phone}', array['Service 1', 'Service 2'], 'available')`);
sql += artisanValues.join(",\n") + ";\n\n";

const unsplashIds = [
  '1560448204-e02f11c3d0e2', '1512917774080-9991f1c4c750', '1518780664697-55e3ad937233', 
  '1522708323590-d24dbb6b0267', '1484154218962-a197022b5858', '1449844908441-8829872d2607', 
  '1513694203232-719a280e022f', '1494526585095-c41746248156', '1600596542815-ffad4c1539a9',
  '1523217582562-09d0def993a6'
];

function get4Photos(seed) {
  let urls = [];
  for (let k = 0; k < 4; k++) {
    const id = unsplashIds[(seed + k) % unsplashIds.length];
    urls.push(`'https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=60'`);
  }
  return `array[${urls.join(',')}]`;
}

const listings = [];
const cities = ['Accra', 'Kumasi', 'Takoradi', 'Tema', 'Tamale', 'Cape Coast'];
const types = ['Apartment', 'House', 'Studio', 'Compound House Room', 'Villa', 'Chamber and Hall'];
let listingCounter = 1;

agents.forEach((agent, index) => {
  // Give each agent exactly 2 listings
  for (let j = 0; j < 2; j++) {
    const city = cities[(index + j) % cities.length];
    const type = types[(index * 2 + j) % types.length];
    const price = 500 + ((index * 3 + j * 7) % 30) * 100;
    
    listings.push({
      id: genUUID(`listing${listingCounter}`),
      agent: agent.id,
      title: `${type} in ${city}`,
      description: `Beautiful and spacious ${type.toLowerCase()} available for rent in a serene environment in ${city}. Close to major amenities.`,
      price: price,
      landmark: `${city} Central`,
      city: city,
      lat: 5.0 + (index % 10) * 0.1,
      lng: -1.0 + (j % 5) * 0.1,
      bed: 1 + ((index + j) % 4),
      bath: 1 + ((index * j) % 3),
      self: (index + j) % 2 === 0,
      kitchen: (index + j) % 3 === 0,
      shared_bath: (index + j) % 4 === 0,
      photosArrayString: get4Photos(listingCounter)
    });
    listingCounter++;
  }
});

sql += `insert into listings (id, agent_id, title, description, price, landmark, city, latitude, longitude, bedrooms, bathrooms, is_self_contained, has_shared_kitchen, has_shared_bathroom, photo_urls, status) values\n`;
const listingValues = listings.map(l => `('${l.id}', '${l.agent}', '${l.title}', '${l.description}', ${l.price}, '${l.landmark}', '${l.city}', ${l.lat}, ${l.lng}, ${l.bed}, ${l.bath}, ${l.self}, ${l.kitchen}, ${l.shared_bath}, ${l.photosArrayString}, 'available')`);
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
sql += `insert into in_app_notifications (user_id, type, title, message) values ('${agents[0].id}', 'message', 'New Message', 'You have a new message from ${renters[0].name}.');\n\n`;

sql += `-- ============================================================\n-- NEWSLETTER\n-- ============================================================\n\n`;
sql += `insert into newsletter_subscribers (email) values ('test@newsletter.com');\n\n`;

fs.writeFileSync("supabase/seed.sql", sql);
console.log("seed.sql generated successfully with realistic names and avatars!");
