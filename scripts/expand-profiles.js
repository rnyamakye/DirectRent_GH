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

  // Replace max-w-4xl mx-auto with nothing, so it expands to w-full
  content = content.replace(
    /className="flex flex-col gap-8 w-full max-w-4xl mx-auto"/g,
    'className="flex flex-col gap-8 w-full"'
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${p}`);
}
