import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('[Build] Step 1: Preparing index.html for Vite');
fs.copyFileSync(path.join(rootDir, 'index.source.html'), path.join(rootDir, 'index.html'));

console.log('[Build] Step 2: Running Vite build...');
execSync('npx vite build', { stdio: 'inherit', cwd: rootDir });

console.log('[Build] Step 3: Copying dist/index.html to root index.html for static web hosting');
const builtIndex = path.join(distDir, 'index.html');
if (fs.existsSync(builtIndex)) {
  fs.copyFileSync(builtIndex, path.join(rootDir, 'index.html'));
}

// Real files so Hostinger serves these routes instead of a 404.
// The "&" in /t&c/ is not rewritten reliably on static hosts.
const spaRoutes = [
  'terms/students/index.html',
  'terms/instructors/index.html',
  't&c/students/index.html',
  't&c/instructors/index.html',
];
console.log('[Build] Step 3b: Publishing terms routes as real index.html files');
for (const rel of spaRoutes) {
  for (const base of [rootDir, distDir]) {
    const dest = path.join(base, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(rootDir, 'index.html'), dest);
  }
}

console.log('[Build] Step 4: Syncing compiled assets to root assets/');
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');

if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  fs.readdirSync(distAssets).forEach(file => {
    const srcFile = path.join(distAssets, file);
    const destFile = path.join(rootAssets, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

console.log('[Build] Step 5: Syncing instructor_docs to root instructor_docs/');
const distDocs = path.join(distDir, 'instructor_docs');
const rootDocs = path.join(rootDir, 'instructor_docs');
if (fs.existsSync(distDocs)) {
  if (!fs.existsSync(rootDocs)) {
    fs.mkdirSync(rootDocs, { recursive: true });
  }
  fs.readdirSync(distDocs).forEach(file => {
    const srcFile = path.join(distDocs, file);
    const destFile = path.join(rootDocs, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

console.log('[Build] Build complete! Root index.html and assets/ updated for Hostinger production.');
