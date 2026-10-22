// Post-build safety net for dist/ (prerendered pages in dist/client/).
//  1. URL protection: every route in tests/routes.snapshot.txt must still be built, or have a
//     permanent redirect (src/data/redirects.ts) and be listed in tests/legacy-urls.txt. New
//     routes are reported; accept them with `--update`. Every URL in tests/legacy-urls.txt (all
//     Substack URLs) resolves to a page directly or with exactly one redirect.
//  2. Every internal link, image and asset referenced from the HTML resolves to a file.
//  3. Sitemap and indexing: only indexable pages in the sitemap; og:image files exist.
//  4. Privacy: no third-party scripts/iframes/images on page view (YouTube loads on click).
//  5. Posts: the cover above the text is not repeated inside the text.
import { redirects } from '../src/data/redirects.ts';
import { checkRedirects, resolvePath } from '../src/lib/redirects.ts';
import { stripTrailingSlash } from '../src/lib/seo.ts';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LEGACY, readLegacy } from './lib/legacy-urls.mjs';

const DIST = 'dist/client';
const SNAPSHOT = 'tests/routes.snapshot.txt';
const update = process.argv.includes('--update');

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const htmlFiles = walk(DIST).filter(f => f.endsWith('.html'));
function toRoute(file) {
  const rel = '/' + relative(DIST, file).split('\\').join('/');
  if (rel === '/index.html') return '/';
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}
const pages = new Map(htmlFiles.map(f => [toRoute(f), readFileSync(f, 'utf8')]));
const routes = [...pages.keys()].sort();
// On-demand routes (not in dist/client) that still count as pages for the checks below.
const DYNAMIC = ['/404'];
const built = new Set([...routes, ...DYNAMIC, '/feed.xml', '/sitemap-index.xml']);
let failed = false;

// 1. Route snapshot
if (update || !existsSync(SNAPSHOT)) {
  writeFileSync(SNAPSHOT, routes.join('\n') + '\n');
  console.log(`Route snapshot written: ${routes.length} routes → ${SNAPSHOT}`);
} else {
  const expected = readFileSync(SNAPSHOT, 'utf8').split('\n').filter(Boolean);
  const legacy = new Set(readLegacy().map(l => l.path));
  const gone = expected.filter(r => !built.has(r));
  const moved = gone.filter(r => resolvePath(r, redirects, built)?.status === 301);
  const missing = gone.filter(r => !moved.includes(r));
  const unlisted = moved.filter(r => !legacy.has(r));
  const added = routes.filter(r => !expected.includes(r));
  if (missing.length) { failed = true; console.error(`✗ ${missing.length} route(s) from the snapshot are no longer built and have no redirect (URLs must not disappear):`); missing.forEach(r => console.error(`    ${r}`)); }
  if (unlisted.length) { failed = true; console.error(`✗ ${unlisted.length} moved route(s) missing in ${LEGACY}:`); unlisted.forEach(r => console.error(`    ${r}`)); }
  if (added.length) { failed = true; console.error(`✗ ${added.length} new route(s) not in the snapshot. If intended: npm run check:dist -- --update`); added.forEach(r => console.error(`    ${r}`)); }
  if (!gone.length && !added.length) console.log(`✓ All ${routes.length} routes match the snapshot`);
}

// 1b. Redirects and old URLs
{
  const errors = checkRedirects(redirects, built);
  const legacy = readLegacy();
  const unresolved = legacy.filter(l => !l.gone && !resolvePath(l.path, redirects, built));
  for (const l of unresolved) errors.push(`${l.path}: old URL does not resolve (no page, no redirect)`);
  if (errors.length) { failed = true; console.error(`✗ ${errors.length} redirect problem(s):`); errors.slice(0, 20).forEach(e => console.error(`    ${e}`)); }
  else console.log(`✓ Redirects: ${redirects.length} rules consistent; ${legacy.length} old URLs checked (${legacy.filter(l => !l.gone && resolvePath(l.path, redirects, built)?.status === 301).length} via redirect)`);
}

// 2. Internal references
function resolves(ref) {
  let path = ref.split(/[?#]/)[0];
  if (!path || path === '/') return true;
  try { path = decodeURI(path); } catch { return false; }
  if (path.startsWith('/api/')) return true;
  const file = join(DIST, path);
  return (existsSync(file) && statSync(file).isFile()) || existsSync(join(file, 'index.html')) || existsSync(file + '.html') || DYNAMIC.includes(path);
}
const ATTR = /\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/g;
const SRCSET = /\bsrcset\s*=\s*["']([^"']+)["']/g;
const CSS_URL = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
const broken = new Map();
for (const [route, html] of pages) {
  const refs = [
    ...[...html.matchAll(ATTR)].map(m => m[1]),
    ...[...html.matchAll(SRCSET)].flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+/)[0])),
    ...[...html.matchAll(CSS_URL)].map(m => m[1]),
  ].map(r => r.replace(/&amp;/g, '&'));
  for (const ref of refs) {
    if (!ref.startsWith('/') || ref.startsWith('//')) continue;
    if (!resolves(ref)) {
      if (!broken.has(ref)) broken.set(ref, new Set());
      broken.get(ref).add(route);
    }
  }
}
if (broken.size) {
  failed = true;
  console.error(`✗ ${broken.size} broken internal reference(s):`);
  for (const [ref, pages] of broken) console.error(`    ${ref}  (on ${[...pages].slice(0, 3).join(', ')})`);
} else console.log(`✓ All internal links and assets in ${htmlFiles.length} pages resolve`);

// 3. Sitemap and og:image
const robotsOf = html => html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
const noindex = new Set([...pages].filter(([, html]) => robotsOf(html).includes('noindex')).map(([route]) => route));
const seoErrors = [];
const sitemapFiles = readdirSync(DIST).filter(f => /^sitemap-\d+\.xml$/.test(f));
if (!sitemapFiles.length) seoErrors.push('no sitemap-*.xml in dist');
for (const f of sitemapFiles) {
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = stripTrailingSlash(new URL(m[1]).pathname);
    if (!pages.has(path)) seoErrors.push(`sitemap lists ${path}, which is not a built page`);
    if (noindex.has(path)) seoErrors.push(`sitemap lists noindex page ${path}`);
  }
}
for (const [route, html] of pages) {
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!og) { seoErrors.push(`${route}: no og:image`); continue; }
  const path = new URL(og).pathname;
  if (!existsSync(join(DIST, decodeURI(path)))) seoErrors.push(`${route}: og:image ${path} missing`);
  if (!/<link rel="canonical" href="https:\/\/www\.beyondbacklog\.de/.test(html)) seoErrors.push(`${route}: canonical missing or wrong host`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) seoErrors.push(`${route}: no meta description`);
}
if (seoErrors.length) { failed = true; console.error(`✗ ${seoErrors.length} SEO problem(s):`); seoErrors.slice(0, 15).forEach(e => console.error(`    ${e}`)); }
else console.log(`✓ SEO: sitemap consistent, ${noindex.size} noindex pages, every page has canonical, description and og:image`);

// 4. Privacy: nothing third-party on page view.
const privacyErrors = [];
for (const [route, html] of pages) {
  for (const m of html.matchAll(/<(iframe|embed|object)\b/gi)) privacyErrors.push(`${route}: static <${m[1]}>`);
  for (const m of html.matchAll(/\s(src|srcset|poster)="(?:[^"]*\s)?(https?:)?\/\/([^/"\s]+)/gi)) privacyErrors.push(`${route}: ${m[1]} loads from https://${m[3]} on page view`);
  if (/fonts\.googleapis\.com/.test(html)) privacyErrors.push(`${route}: Google Fonts`);
}
if (privacyErrors.length) { failed = true; console.error(`✗ ${privacyErrors.length} privacy problem(s):`); privacyErrors.slice(0, 10).forEach(e => console.error(`    ${e}`)); }
else console.log('✓ Privacy: no third-party embeds, media or fonts on page view');

// 5. Posts: the cover above the text (<figure data-cover>) is not repeated in the article text.
//    Same source image = same content hash in the asset name (/_astro/<name>.<hash>_<variant>.webp),
//    whatever the file is called. Only the article counts, not the related-post cards below it.
const assetHash = src => src.match(/\/_astro\/[^"/]*?\.([A-Za-z0-9_-]{8})_[^"/.]+\.\w+/)?.[1];
const coverErrors = [];
for (const [route, html] of pages) {
  if (!route.startsWith('/p/')) continue;
  const figure = html.match(/<figure\b[^>]*\sdata-cover\b[^>]*>([\s\S]*?)<\/figure>/);
  if (!figure) continue;
  const hash = [...figure[1].matchAll(ATTR)].map(m => assetHash(m[1])).find(Boolean);
  const text = html.slice(figure.index + figure[0].length, html.indexOf('</article>', figure.index));
  if (hash && [...text.matchAll(ATTR)].some(m => assetHash(m[1]) === hash)) coverErrors.push(route);
}
if (coverErrors.length) { failed = true; console.error(`✗ ${coverErrors.length} post(s) show the cover twice (above and in the text):`); coverErrors.forEach(e => console.error(`    ${e}`)); }
else console.log('✓ Posts: no cover shown twice');

if (failed) process.exit(1);
