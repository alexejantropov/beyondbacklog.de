// Derives the site images from the Substack brand backup: logo (src/assets/site/logo.png),
// social preview card (src/assets/site/og-default.png, 1200×630) and favicons (public/).
// Run once: node scripts/site-assets.mjs
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';

const LOGO = 'migration/substack-public/brand/logo-707.png';
const AUTHOR = 'migration/substack-public/brand/author-photo-785.jpeg';
if (!existsSync(LOGO)) throw new Error(`${LOGO} missing: run the Substack backup first (migration.md, step 0)`);
mkdirSync('src/assets/site', { recursive: true });
mkdirSync('public', { recursive: true });

await sharp(LOGO).resize(512, 512).png().toFile('src/assets/site/logo.png');
if (existsSync(AUTHOR)) await sharp(AUTHOR).resize(1000, 1000, { fit: 'cover' }).jpeg({ quality: 84 }).toFile('src/assets/site/author.jpg');

// Social card: paper background, logo left, wordmark + tagline as SVG text.
const logo = await sharp(LOGO).resize(360, 360).png().toBuffer();
const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <style>.t{font-family:'Open Sans',Helvetica,Arial,sans-serif;fill:#0a0a0a}.h{font-family:'Caveat',cursive;fill:#6d33b8}</style>
  <rect width="1200" height="630" fill="#fafaf7"/>
  <rect x="0" y="0" width="1200" height="12" fill="#9747ff"/>
  <text x="500" y="250" class="t" font-size="70" font-weight="800" letter-spacing="-2">Beyond Backlog</text>
  <text x="500" y="320" class="t" font-size="30" fill-opacity="0.72">Über digitale Produktentwicklung</text>
  <text x="500" y="362" class="t" font-size="30" fill-opacity="0.72">&amp; Künstliche Intelligenz.</text>
  <text x="500" y="440" class="h" font-size="40">Newsletter &amp; Blog von Alexej Antropov</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#fafaf7' } })
  .composite([{ input: text }, { input: logo, left: 90, top: 135 }])
  .png()
  .toFile('src/assets/site/og-default.png');

for (const [size, name] of [[192, 'favicon-192.png'], [180, 'apple-touch-icon.png'], [32, 'favicon-32.png']]) {
  await sharp(LOGO).resize(size, size).png().toFile(`public/${name}`);
}
// ICO container with the 32px PNG (browsers accept PNG-in-ICO).
const png32 = await sharp(LOGO).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));
console.log('site assets written');
