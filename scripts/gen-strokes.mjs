// Regenerates strokes-data.js: keeps every existing HW_DATA entry as-is
// (class wall + HSK 1-3) and appends stroke data for any character in DATA
// that is missing, from the hanzi-writer-data package (Arphic license).
// Usage: node scripts/gen-strokes.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const html = readFileSync('index.html', 'utf8');
const data = JSON.parse(html.match(/const DATA = (\[[\s\S]*?\]);\n/)[1]);
const src = readFileSync('strokes-data.js', 'utf8');
const hw = JSON.parse(src.slice(src.indexOf('=') + 1).replace(/;\s*$/, ''));

const need = new Set();
for (const w of data) for (const c of w.w) if (/\p{Script=Han}/u.test(c)) need.add(c);
const missing = [...need].filter(c => !hw[c]);
let added = 0, absent = [];
for (const c of missing) {
  try { hw[c] = require(`hanzi-writer-data/${c}.json`); added++; }
  catch { absent.push(c); }
}
writeFileSync('strokes-data.js', 'window.HW_DATA=' + JSON.stringify(hw) + ';');
console.log(`chars needed ${need.size}, had ${need.size - missing.length}, added ${added}, unavailable ${absent.length} ${absent.join('')}`);
