const fs = require('fs');
const crypto = require('crypto');

const sql = [];
sql.push('\n-- GENERATED DATA FOR PAGINATION TESTING --\n');

// Arrays to hold IDs
const agentIds = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'];
const artisanIds = [];

// Generate 10 Agents
for (let i = 0; i < 10; i++) {
    const id = crypto.randomUUID();
    agentIds.push(id);
    const email = `agent${i + 1}@directrent.test`;
    const meta = JSON.stringify({ 
        full_name: `Test Agent ${i + 1}`, 
        role: 'agent', 
        business_name: `Agent Business ${i + 1}`,
        phone: `02400000${i.toString().padStart(2, '0')}`
    });
    sql.push(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values ('00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated', '${email}', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '${meta}', now(), now(), '', '', '', '', false);`);
}

// Generate 30 Artisans
for (let i = 0; i < 30; i++) {
    const id = crypto.randomUUID();
    artisanIds.push(id);
    const email = `artisan${i + 1}@directrent.test`;
    const meta = JSON.stringify({ full_name: `Test Artisan ${i + 1}`, role: 'artisan' });
    sql.push(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user) values ('00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated', '${email}', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '${meta}', now(), now(), '', '', '', '', false);`);
    
    // Artisan Profiles
    const trades = ['Plumber', 'Carpenter', 'Mason', 'Electrician', 'Painter'];
    const trade = trades[Math.floor(Math.random() * trades.length)];
    sql.push(`insert into artisan_profiles (id, trade, service_area, bio, phone, services, availability) values ('${id}', '${trade}', 'Kumasi', 'Experienced ${trade}', '0240000000', array['Service 1', 'Service 2'], 'available');`);
}

// Generate 100 Listings
for (let i = 0; i < 100; i++) {
    const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const price = Math.floor(Math.random() * 2000) + 500;
    const propertyType = ['Apartment', 'House', 'Room', 'Studio'][Math.floor(Math.random() * 4)];
    const city = ['Kumasi', 'Accra', 'Takoradi'][Math.floor(Math.random() * 3)];
    
    // Generate realistic coordinates around the city
    let lat, lng;
    if (city === 'Kumasi') {
        lat = 6.6885 + (Math.random() - 0.5) * 0.1;
        lng = -1.6244 + (Math.random() - 0.5) * 0.1;
    } else if (city === 'Accra') {
        lat = 5.6037 + (Math.random() - 0.5) * 0.1;
        lng = -0.1870 + (Math.random() - 0.5) * 0.1;
    } else { // Takoradi
        lat = 4.8970 + (Math.random() - 0.5) * 0.1;
        lng = -1.7554 + (Math.random() - 0.5) * 0.1;
    }
    
    sql.push(`insert into listings (agent_id, title, description, price, landmark, status, property_type, bedrooms, bathrooms, city, latitude, longitude) values ('${agentId}', 'Test Listing ${i + 1} - ${propertyType}', 'Description for listing ${i + 1}. Beautiful ${propertyType}.', ${price}, 'Landmark ${i + 1}', 'available', '${propertyType}', ${Math.floor(Math.random() * 4) + 1}, ${Math.floor(Math.random() * 3) + 1}, '${city}', ${lat.toFixed(6)}, ${lng.toFixed(6)});`);
}

// Append to the file instead of overwriting, to preserve static seed data
fs.appendFileSync('d:/Projects/New folder/directrent-gh/supabase/seed.sql', sql.join('\n'));
console.log('Appended new data to seed.sql');
