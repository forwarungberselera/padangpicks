/**
 * Post-build script: copy dist/index.html -> dist/404.html
 *
 * Cloudflare Pages serves 404.html for any path that doesn't match a static
 * asset, which makes it the correct SPA fallback without triggering the
 * "_redirects infinite loop" error (code 100324).
 */
import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const src = resolve(distDir, 'index.html');
const dest = resolve(distDir, '404.html');

if (!existsSync(src)) {
  console.error('❌  dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

copyFileSync(src, dest);
console.log('✅  Copied dist/index.html → dist/404.html (Cloudflare Pages SPA fallback)');
