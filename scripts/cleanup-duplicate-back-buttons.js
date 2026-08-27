const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/app/renter/dashboard/page.tsx',
  'src/app/artisan/dashboard/page.tsx',
  'src/app/artisan/overview/page.tsx',
  'src/app/agent/dashboard/page.tsx',
  'src/app/agent/profile/[id]/page.tsx',
  'src/app/agent/listings/[id]/edit/page.tsx',
  'src/app/agent/listings/page.tsx',
  'src/app/agent/listings/new/page.tsx',
];

const basePath = path.join(__dirname, '..');

for (const relPath of filesToClean) {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Remove <BackButton />
  content = content.replace(/\s*<BackButton\s*\/>\s*/g, '\n');

  // Remove import { BackButton }
  content = content.replace(/import\s+\{\s*BackButton\s*\}\s+from\s+["']@\/components\/back-button["'];?\s*/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Cleaned up ${relPath}`);
  }
}
