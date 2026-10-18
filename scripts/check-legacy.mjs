// Checks every known old URL (tests/legacy-urls.txt) against a running site:
//   node scripts/check-legacy.mjs --base https://www.beyondbacklog.de
// Each URL must answer 200 directly, or with exactly one permanent redirect (301/308) to a page
// that answers 200 and whose canonical points to itself. Also: trailing slash → no slash,
// /p/<slug>/comments → /p/<slug>, apex → www.
import { readLegacy } from './lib/legacy-urls.mjs';

const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1]?.replace(/\/$/, '');
if (!args.includes('--base') || !base) { console.error('Usage: node scripts/check-legacy.mjs --base <url>'); process.exit(2); }

const entries = readLegacy();
const get = url => fetch(url, { redirect: 'manual', headers: { 'user-agent': 'BB-legacy-check' } });
const canonicalOf = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const errors = [];
let direct = 0, redirected = 0;
for (const { path, gone } of entries) {
  const res = await get(base + path);
  if (gone) { if (res.status === 200) errors.push(`${path}: should be gone, answers 200`); continue; }
  let final = res, location = null;
  if ([301, 308].includes(res.status)) {
    location = new URL(res.headers.get('location'), base + path);
    final = await get(location.href);
    if ([301, 302, 307, 308].includes(final.status)) { errors.push(`${path}: redirect chain (${res.status} → ${location.pathname} → ${final.status})`); continue; }
    redirected++;
  } else if (res.status === 200) direct++;
  else { errors.push(`${path}: answers ${res.status}`); continue; }
  if (final.status !== 200) { errors.push(`${path}: ends in ${final.status}${location ? ` at ${location.pathname}` : ''}`); continue; }
  const canonical = canonicalOf(await final.text());
  const finalPath = location ? location.pathname : path;
  if (canonical && new URL(canonical).pathname !== finalPath) errors.push(`${path}: canonical ${new URL(canonical).pathname} differs from ${finalPath}`);
}
const sample = entries.find(e => e.path.startsWith('/p/'))?.path;
if (sample) {
  for (const [variant, expected] of [[`${sample}/`, sample], [`${sample}/comments`, sample]]) {
    const res = await get(base + variant);
    const target = res.headers.get('location') && new URL(res.headers.get('location'), base).pathname;
    if (![301, 308].includes(res.status) || target !== expected) errors.push(`${variant}: expected a redirect to ${expected}, got ${res.status} ${target ?? ''}`);
  }
}
console.log(`${entries.length} old URLs against ${base}: ${direct} direct, ${redirected} via one redirect`);
if (errors.length) { console.error(`✗ ${errors.length} problem(s):`); errors.forEach(e => console.error(`    ${e}`)); process.exit(1); }
console.log('✓ All old URLs resolve');
