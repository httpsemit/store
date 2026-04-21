import fs from 'fs';
import path from 'path';

function traverseDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, callback);
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                callback(fullPath);
            }
        }
    });
}

const mappings = [
    { regex: /bg-white/g, replacement: 'bg-white dark:bg-[#0a0a0a]' },
    { regex: /bg-gray-50/g, replacement: 'bg-gray-50 dark:bg-[#121212]' },
    { regex: /bg-slate-50/g, replacement: 'bg-slate-50 dark:bg-[#0a0a0a]' },
    { regex: /bg-gray-100/g, replacement: 'bg-gray-100 dark:bg-gray-900' },
    { regex: /border-gray-50/g, replacement: 'border-gray-50 dark:border-white\/5' },
    { regex: /border-gray-100/g, replacement: 'border-gray-100 dark:border-white\/10' },
    { regex: /border-gray-200/g, replacement: 'border-gray-200 dark:border-white\/20' },
    { regex: /border-slate-200/g, replacement: 'border-slate-200 dark:border-white\/20' },
    { regex: /text-gray-900/g, replacement: 'text-gray-900 dark:text-white' },
    { regex: /text-slate-900/g, replacement: 'text-slate-900 dark:text-white' },
    { regex: /text-gray-800/g, replacement: 'text-gray-800 dark:text-gray-100' },
    { regex: /text-gray-700/g, replacement: 'text-gray-700 dark:text-gray-200' },
    { regex: /text-gray-600/g, replacement: 'text-gray-600 dark:text-gray-300' },
    { regex: /text-gray-500/g, replacement: 'text-gray-500 dark:text-gray-400' },
];

traverseDir('e:/anti/amitstore/store/src', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    mappings.forEach(m => {
       content = content.replace(m.regex, m.replacement);
    });

    // Cleanup potential double darks if script is run twice
    content = content.replace(/dark:bg-\[#0a0a0a\]( dark:bg-\[#0a0a0a\])+/g, 'dark:bg-[#0a0a0a]');
    content = content.replace(/dark:bg-\[#121212\]( dark:bg-\[#121212\])+/g, 'dark:bg-[#121212]');
    content = content.replace(/dark:bg-gray-900( dark:bg-gray-900)+/g, 'dark:bg-gray-900');
    content = content.replace(/dark:border-white\/5( dark:border-white\/5)+/g, 'dark:border-white/5');
    content = content.replace(/dark:border-white\/10( dark:border-white\/10)+/g, 'dark:border-white/10');
    content = content.replace(/dark:border-white\/20( dark:border-white\/20)+/g, 'dark:border-white/20');
    content = content.replace(/dark:text-white( dark:text-white)+/g, 'dark:text-white');
    content = content.replace(/dark:text-gray-100( dark:text-gray-100)+/g, 'dark:text-gray-100');
    content = content.replace(/dark:text-gray-200( dark:text-gray-200)+/g, 'dark:text-gray-200');
    content = content.replace(/dark:text-gray-300( dark:text-gray-300)+/g, 'dark:text-gray-300');
    content = content.replace(/dark:text-gray-400( dark:text-gray-400)+/g, 'dark:text-gray-400');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
});
