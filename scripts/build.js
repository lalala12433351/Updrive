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
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(rootDir, 'index.html'));
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

console.log('[Build] Build complete! Root index.html and assets/ updated for Hostinger production.');
