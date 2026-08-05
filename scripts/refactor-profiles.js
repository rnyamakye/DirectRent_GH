const fs = require('fs');
const path = require('path');

const profilePaths = [
  'artisan/profile/security/page.tsx',
  'artisan/profile/personal/page.tsx',
  'artisan/profile/payments/page.tsx',
  'artisan/profile/notifications/page.tsx',
  'agent/profile/personal/page.tsx',
  'agent/profile/payments/page.tsx',
  'agent/profile/notifications/page.tsx',
  'agent/profile/security/page.tsx',
  'renter/profile/personal/page.tsx',
  'renter/profile/payments/page.tsx',
  'renter/profile/notifications/page.tsx',
  'renter/profile/security/page.tsx',
];

const basePath = path.join(__dirname, '..', 'src', 'app');

for (const p of profilePaths) {
  const fullPath = path.join(basePath, p);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${p} - not found`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace main wrapper
  content = content.replace(
    /className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:items-start w-full max-w-6xl mx-auto"/g,
    'className="flex flex-col gap-8 w-full max-w-4xl mx-auto"'
  );

  // Replace left column wrapper
  content = content.replace(
    /<div className="lg:col-span-4 flex flex-col gap-4">/g,
    '<div className="flex flex-col gap-4">'
  );

  // Replace right column wrapper
  content = content.replace(
    /<div className="lg:col-span-8 flex flex-col gap-8 w-full">/g,
    '<div className="flex flex-col gap-8 w-full">'
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${p}`);
}
