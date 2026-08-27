const fs = require('fs');
const path = require('path');

const files = [
    {
        path: 'src/app/renter/profile/personal/page.tsx',
        action: 'Personal information saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/renter/profile/notifications/page.tsx',
        action: 'Notification preferences saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/renter/profile/edit/page.tsx',
        action: 'Profile updated successfully.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 3000\);/g
    },
    {
        path: 'src/app/artisan/profile/personal/page.tsx',
        action: 'Personal information saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/artisan/profile/notifications/page.tsx',
        action: 'Notification preferences saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/artisan/profile/edit/page.tsx',
        action: 'Profile updated successfully.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 3000\);/g
    },
    {
        path: 'src/app/agent/profile/personal/page.tsx',
        action: 'Personal information saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/agent/profile/notifications/page.tsx',
        action: 'Notification preferences saved.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/agent/profile/edit/page.tsx',
        action: 'Profile updated successfully.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 3000\);/g
    },
    {
        path: 'src/app/agent/listings/[id]/edit/page.tsx',
        action: 'Listing updated successfully.',
        regex: /setSaved\(true\);\s*setTimeout\(\(\) => setSaved\(false\), 2500\);/g
    },
    {
        path: 'src/app/renter/profile/security/page.tsx',
        action: 'Password updated successfully.',
        regex: /setPwSuccess\(true\);\s*setCurrentPassword\(""\); setNewPassword\(""\); setConfirmPassword\(""\);\s*setTimeout\(\(\) => setPwSuccess\(false\), 3000\);/g,
        hasCustomRegex: true,
        replacement: 'toast.success("Password updated successfully.");\n    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");\n    router.back();'
    },
    {
        path: 'src/app/agent/profile/security/page.tsx',
        action: 'Password updated successfully.',
        regex: /setPwSuccess\(true\);\s*setCurrentPassword\(""\); setNewPassword\(""\); setConfirmPassword\(""\);\s*setTimeout\(\(\) => setPwSuccess\(false\), 3000\);/g,
        hasCustomRegex: true,
        replacement: 'toast.success("Password updated successfully.");\n    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");\n    router.back();'
    },
    {
        path: 'src/app/artisan/profile/security/page.tsx',
        action: 'Password updated successfully.',
        regex: /setPwSuccess\(true\);\s*setCurrentPassword\(""\); setNewPassword\(""\); setConfirmPassword\(""\);\s*setTimeout\(\(\) => setPwSuccess\(false\), 3000\);/g,
        hasCustomRegex: true,
        replacement: 'toast.success("Password updated successfully.");\n    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");\n    router.back();'
    }
];

files.forEach(f => {
    const fullPath = path.join(__dirname, f.path);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Ensure toast is imported
        if (!content.includes('import toast from "react-hot-toast"')) {
            content = content.replace(/(import .*;\n)/, '$1import toast from "react-hot-toast";\n');
        }

        // Ensure useRouter is imported if needed for router.back()
        // Wait, most of these pages might not have useRouter imported.
        if (!content.includes('import { useRouter } from "next/navigation"')) {
            content = content.replace(/(import .*;\n)/, '$1import { useRouter } from "next/navigation";\n');
        }
        
        // Ensure router is instantiated in the component
        // Usually `export default function Page() {`
        if (!content.includes('const router = useRouter();')) {
            content = content.replace(/(export default function .*\(.*\) \{\n)/, '$1  const router = useRouter();\n');
        }

        // Replace the save/success logic
        if (f.hasCustomRegex) {
            content = content.replace(f.regex, f.replacement);
        } else {
            content = content.replace(f.regex, `toast.success("${f.action}");\n    router.back();`);
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${f.path}`);
    } else {
        console.log(`Not found: ${f.path}`);
    }
});
