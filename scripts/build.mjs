// Copies the web app into dist/ for Capacitor packaging.
// Explicit allowlist: class-data.js (private course vocabulary) must never ship.
import { mkdir, copyFile, rm, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const ASSETS = [
  'index.html',
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  'hanzi-writer.min.js',
  'strokes-data.js',
  'examples.js',
  'privacy.html',
  'terms.html',
  'support.html',
];

const DENY = ['class-data.js'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const name of ASSETS) {
  if (DENY.includes(name)) throw new Error(`refusing to copy ${name}`);
  await access(join(root, name));
  await copyFile(join(root, name), join(dist, name));
  console.log(`copied ${name}`);
}

for (const name of DENY) {
  try {
    await access(join(dist, name));
    throw new Error(`FATAL: ${name} present in dist/`);
  } catch (e) {
    if (e.message.startsWith('FATAL')) throw e;
  }
}

console.log(`\n${ASSETS.length} files -> dist/`);
