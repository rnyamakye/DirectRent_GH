const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcPath = path.join(__dirname, '..', 'src');

walk(srcPath, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  // skip the component definitions themselves to avoid messing them up
  if (filePath.includes('back-button.tsx')) return;
  if (filePath.includes('breadcrumbs.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace imports
  content = content.replace(
    /import\s+\{\s*Breadcrumbs\s*\}\s+from\s+["']@\/components\/breadcrumbs["'];?/g,
    'import { BackButton } from "@/components/back-button";'
  );
  content = content.replace(
    /import\s+\{\s*Breadcrumbs\s*\}\s+from\s+["']\.\/breadcrumbs["'];?/g,
    'import { BackButton } from "./back-button";'
  );
  content = content.replace(
    /import\s+\{\s*DynamicBreadcrumbs\s*\}\s+from\s+["']@\/components\/dynamic-breadcrumbs["'];?/g,
    'import { BackButton } from "@/components/back-button";'
  );

  // Replace components usage
  // `<Breadcrumbs items={...} />` - can be multi-line
  content = content.replace(/<Breadcrumbs[\s\S]*?\/>/g, '<BackButton />');
  
  // `<DynamicBreadcrumbs />`
  content = content.replace(/<DynamicBreadcrumbs\s*\/>/g, '<BackButton />');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
