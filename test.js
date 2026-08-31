const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    acc[match[1].trim()] = val;
  }
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: tours, error: err } = await supabase.from('tour_requests').select('*');
  console.log('Tours:', tours, 'Err:', err);
  
  if (tours && tours.length > 0) {
    const renterIds = [...new Set(tours.map((t) => t.renter_id))];
    const listingIds = [...new Set(tours.map((t) => t.listing_id))];

    console.log('renterIds:', renterIds);
    console.log('listingIds:', listingIds);

    const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name').in('id', renterIds);
    console.log('Profiles:', profiles, 'pErr:', pErr);

    const { data: listings, error: lErr } = await supabase.from('listings').select('id, title').in('id', listingIds);
    console.log('Listings:', listings, 'lErr:', lErr);
  }
}
test();
