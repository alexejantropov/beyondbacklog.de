// Substack → Markdown converter (migration.md, section 5.2). Reads the public backup in
// migration/substack-public/ (posts/<slug>.json with body_html, images/manifest.json, videos/),
// writes src/content/posts/<slug>.md and src/assets/posts/<slug>/… Idempotent: run it again after
// a new backup; hand edits in the Markdown are overwritten unless the file carries
// `imported: false` in its frontmatter (then it is skipped).
//
//   node scripts/import-substack.mjs            all posts
//   node scripts/import-substack.mjs <slug>…    only these
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { parse } from 'node-html-parser';
import TurndownService from 'turndown';
import YAML from 'yaml';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { redirects } from '../src/data/redirects.ts';
import { site } from '../src/data/site.ts';
import { collapsePostPath, normalizePath, resolveRedirect } from '../src/lib/redirects.ts';
import { countWords } from '../src/lib/seo.ts';

const SRC = 'migration/substack-public';
const OUT_MD = 'src/content/posts';
const OUT_IMG = 'src/assets/posts';
const MAX_PX = 2400;

const index = JSON.parse(readFileSync(join(SRC, 'posts-index.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(SRC, 'images/manifest.json'), 'utf8'));
const byCdn = new Map(manifest.map(m => [m.cdn_url, m]));
const byName = new Map(manifest.map(m => [basename(m.s3_url ?? m.cdn_url), m]));
const only = process.argv.slice(2);
// Slugs with a hand-made Astro page in src/pages/p/ (not imported).
const SKIP = ['work-with-me'];

const SITE_HOST = new URL(site.url).host;
const SELF_HOSTS = ['beyondbacklog.substack.com', SITE_HOST, SITE_HOST.replace(/^www\./, '')];
const TAG_SLUGS = { ki: 'ki', product: 'product', en: 'english-only' };
// Posts without a Substack tag: suggestions from title and text (migration.md, section 5.3);
// correct them here or in the Markdown frontmatter (then set `imported: false` there).
const TAG_SUGGESTIONS = {
  'auswerten-von-kunden-interviews-mit-miro-ai-guide-template': ['ki'],
  'beyond-backlog-produktmanager-tragen': ['product'],
  'das-wichtigste-was-ein-produktmanager': ['product'],
  'keine-angst-die-zukunft-ist-super': ['product'],
  'ux-research-mithilfe-von-ki': ['ki'],
  'was-ware-wenn-sich-8-milliarden-menschen': ['product'],
};

// ---------- helpers ----------
const decodeS3 = url => {
  const i = url.indexOf('/https%3A');
  return i >= 0 ? decodeURIComponent(url.slice(i + 1)) : url;
};
const cleanUrl = raw => {
  if (raw.startsWith('/')) return raw;
  try {
    const u = new URL(raw);
    for (const k of [...u.searchParams.keys()]) if (/^utm_|^r$|^s$|^triedRedirect$/.test(k)) u.searchParams.delete(k);
    if (SELF_HOSTS.includes(u.hostname)) {
      // Own links become site paths; Substack-only paths follow src/data/redirects.ts.
      const path = collapsePostPath(normalizePath(u.pathname));
      if (path === '/' || path.startsWith('/p/')) return `${path}${u.hash}`;
      const hit = resolveRedirect(path, redirects);
      if (hit) return hit.target;
    }
    return u.toString();
  } catch {
    return raw;
  }
};
const esc = s => s.replace(/\s+/g, ' ').trim();
const mdEscapeAlt = s => esc(s).replace(/[[\]]/g, '');

async function localImage(slug, cdnUrl) {
  const entry = byCdn.get(cdnUrl) ?? byName.get(basename(decodeS3(cdnUrl).split('?')[0]));
  if (!entry || !String(entry.status).startsWith('ok')) return null;
  const src = join(SRC, entry.local_path);
  if (!existsSync(src)) return null;
  const dir = join(OUT_IMG, slug);
  mkdirSync(dir, { recursive: true });
  let name = basename(entry.local_path);
  const ext = extname(name).toLowerCase();
  const stem = name.slice(0, -ext.length);
  if (['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    // Photos and screenshots become WebP (quality 82, max 2400 px): smaller sources, and
    // astro:assets derives its responsive variants from them.
    name = `${stem}.webp`;
    const target = join(dir, name);
    if (!existsSync(target)) {
      const input = ext === '.heic' || ext === '.heif' ? await heicConvert({ buffer: readFileSync(src), format: 'JPEG', quality: 0.92 }) : src;
      await sharp(input).rotate().resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
    }
  } else {
    // gif (animated), svg: keep as is
    const target = join(dir, name);
    if (!existsSync(target)) copyFileSync(src, target);
  }
  return `~/assets/posts/${slug}/${name}`;
}

async function isPortrait(assetRef) {
  try {
    const m = await sharp(assetRef.replace('~/assets/', 'src/assets/')).metadata();
    return (m.height ?? 0) > (m.width ?? 0);
  } catch {
    return false;
  }
}

async function youtubeThumb(slug, id) {
  const dir = join(OUT_IMG, slug);
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `yt-${id}.jpg`);
  if (!existsSync(target)) {
    for (const name of ['maxresdefault', 'hqdefault']) {
      const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
      if (res.ok) {
        writeFileSync(target, Buffer.from(await res.arrayBuffer()));
        break;
      }
    }
  }
  return existsSync(target) ? `~/assets/posts/${slug}/yt-${id}.jpg` : null;
}

function videoThumb(slug, uploadId) {
  const file = readdirSync(join(SRC, 'videos')).find(f => f.includes(uploadId) && f.endsWith('.thumb.png'));
  if (!file) return null;
  const dir = join(OUT_IMG, slug);
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `video-${uploadId.slice(0, 8)}.png`);
  if (!existsSync(target)) copyFileSync(join(SRC, 'videos', file), target);
  return `~/assets/posts/${slug}/video-${uploadId.slice(0, 8)}.png`;
}

// Files hosted by Substack (/api/v1/file/<id>.pdf) → public/files/<id>.pdf
async function localFile(rawUrl) {
  const m = rawUrl.match(/\/api\/v1\/file\/([A-Za-z0-9-]+\.[a-z0-9]+)/i);
  if (!m) return null;
  mkdirSync('public/files', { recursive: true });
  const target = join('public/files', m[1]);
  if (!existsSync(target)) {
    const res = await fetch(rawUrl, { headers: { 'user-agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!res.ok) return null;
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  return `/files/${m[1]}`;
}

// ---------- conversion ----------
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
turndown.addRule('cleanLinks', {
  filter: node => node.nodeName === 'A' && node.getAttribute('href'),
  replacement: (content, node) => {
    const href = cleanUrl(node.getAttribute('href'));
    const text = content.trim();
    if (!text) return '';
    return `[${text}](${href})`;
  },
});
turndown.keep(['sup', 'sub']);

async function convertPost(slug, post) {
  const root = parse(post.body_html, { blockTextElements: { script: false, style: false } });
  const blocks = [];
  const block = md => {
    blocks.push(md);
    return `<p>@@BLOCK${blocks.length - 1}@@</p>`;
  };
  const notes = [];
  const replace = (node, html) => node.replaceWith(html);

  // Substack-hosted files (PDF downloads) → local copies; attachment icons go.
  for (const img of root.querySelectorAll('img[src*="attachment_icon"]')) img.remove();
  for (const a of root.querySelectorAll('a[href*="/api/v1/file/"]')) {
    const local = await localFile(a.getAttribute('href'));
    if (local) a.setAttribute('href', local); else notes.push(`file missing ${a.getAttribute('href')}`);
  }

  // File embeds (PDF cards) → download button.
  for (const n of root.querySelectorAll('.file-embed-wrapper')) {
    const a = n.querySelector('a[href]');
    const name = esc(n.querySelector('.file-embed-details-h1')?.text ?? n.querySelector('.file-embed-details')?.text ?? 'Download');
    if (!a) { n.remove(); continue; }
    replace(n, block(`<p><a class="button" href="${a.getAttribute('href')}">${name.replace(/\s*Download\s*$/i, '') || 'Download'} (PDF)</a></p>`));
  }

  // Remove Substack-only widgets.
  for (const sel of ['.subscription-widget-wrap-editor', '.subscription-widget-wrap', '.subscription-widget', '.paywall-jump', '.preamble', '.poll-embed', '.comment-embed', 'style', 'script', '.button-wrapper a[href*="/subscribe"]']) {
    for (const n of root.querySelectorAll(sel)) n.remove();
  }
  for (const n of root.querySelectorAll('p.button-wrapper, div.button-wrapper')) if (!n.querySelector('a')) n.remove();

  // Native Substack videos: thumbnail + TODO (YouTube upload comes at the very end, migration.md).
  for (const n of root.querySelectorAll('.native-video-embed')) {
    let id = '';
    try {
      id = JSON.parse(n.getAttribute('data-attrs') ?? '{}').mediaUploadId ?? '';
    } catch { /* no attrs */ }
    const thumb = id ? videoThumb(slug, id) : null;
    notes.push(`video ${id}`);
    replace(n, block(`${thumb ? `![Video: ${mdEscapeAlt(post.title)}](${thumb})\n` : ''}<!-- TODO video: Substack upload ${id} liegt als MP4 in migration/substack-public/videos/. Nach dem YouTube-Upload ersetzen durch: <a class="video" href="https://www.youtube.com/watch?v=ID">![Video](~/assets/posts/${slug}/yt-ID.jpg)</a> -->`));
  }

  // YouTube embeds → linked preview image (click-to-load player, src/components/YouTubeLinks.astro).
  for (const n of root.querySelectorAll('.youtube-wrap, .youtube2-wrap, iframe[src*="youtube"]')) {
    const iframe = n.tagName === 'IFRAME' ? n : n.querySelector('iframe');
    const id = iframe?.getAttribute('src')?.match(/embed\/([A-Za-z0-9_-]{6,})/)?.[1] ?? n.getAttribute('data-attrs')?.match(/"videoId":"([^"]+)"/)?.[1];
    if (!id) { n.remove(); continue; }
    const thumb = await youtubeThumb(slug, id);
    notes.push(`youtube ${id}`);
    replace(n, block(`<a class="video" href="https://www.youtube.com/watch?v=${id}">${thumb ? `![Video auf YouTube abspielen](${thumb})` : 'Video auf YouTube ansehen'}</a>`));
  }

  // Embedded posts (digest / embedded-post) → internal link line.
  for (const n of root.querySelectorAll('.digest-post-embed, .embedded-post-wrap, .embedded-post')) {
    let href = n.getAttribute('data-attrs') ? (() => { try { return JSON.parse(n.getAttribute('data-attrs')).canonical_url; } catch { return null; } })() : null;
    href = href ?? n.querySelector('a')?.getAttribute('href') ?? '';
    let title = '';
    try { title = JSON.parse(n.getAttribute('data-attrs') ?? '{}').title ?? ''; } catch { /* none */ }
    title = title || esc(n.querySelector('.embedded-post-title, .digest-post-embed-title, h2, h3, strong')?.text ?? '') || 'Zum Beitrag';
    if (!href) { n.remove(); continue; }
    replace(n, block(`→ [${title}](${cleanUrl(href)})`));
  }

  // Substack galleries: images and caption live in data-attrs, not in the DOM. All images go into
  // one paragraph, so they sit side by side (.prose p:has(> img + img) in global.css).
  for (const g of root.querySelectorAll('.image-gallery-embed')) {
    let attrs = {};
    try { attrs = JSON.parse(g.getAttribute('data-attrs') ?? '{}'); } catch { /* none */ }
    const images = attrs.gallery?.images ?? [];
    const caption = esc(attrs.gallery?.caption ?? '');
    const parts = [];
    for (const img of images) {
      const local = img.src ? await localImage(slug, img.src) : null;
      if (local) parts.push(`![${mdEscapeAlt(attrs.gallery?.alt || caption)}](${local})`);
      else notes.push(`gallery image missing ${String(img.src).slice(-60)}`);
    }
    if (!parts.length) { g.remove(); continue; }
    replace(g, block(parts.join(' ') + (caption ? `\n*${caption.replace(/\*/g, '')}*` : '')));
  }

  // Images: figures with captions, plain images. Consecutive portrait images without captions are
  // merged into one paragraph (side by side) instead of stacking several phone screenshots.
  let lastPortraitBlock = -1;
  for (const fig of root.querySelectorAll('.captioned-image-container, figure')) {
    if (!fig.parentNode) continue;
    const imgs = fig.querySelectorAll('img');
    const caption = esc(fig.querySelector('figcaption, .image-caption')?.text ?? '');
    const parts = [];
    let portrait = false;
    for (const img of imgs) {
      const url = img.getAttribute('src') ?? img.getAttribute('data-src') ?? '';
      const local = url ? await localImage(slug, url) : null;
      if (!local) { notes.push(`image missing ${url.slice(0, 80)}`); continue; }
      const alt = mdEscapeAlt(img.getAttribute('alt') || caption || '');
      parts.push(`![${alt}](${local})`);
      portrait = portrait || (await isPortrait(local));
    }
    if (!parts.length) { fig.remove(); continue; }
    const prev = fig.previousElementSibling;
    const prevIsPortraitBlock = lastPortraitBlock >= 0 && prev && prev.text.trim() === `@@BLOCK${lastPortraitBlock}@@`;
    if (portrait && !caption && parts.length === 1 && prevIsPortraitBlock) {
      blocks[lastPortraitBlock] += ' ' + parts[0];
      fig.remove();
      continue;
    }
    replace(fig, block(parts.join('\n\n') + (caption ? `\n*${caption.replace(/\*/g, '')}*` : '')));
    lastPortraitBlock = portrait && !caption && parts.length === 1 ? blocks.length - 1 : -1;
  }
  for (const img of root.querySelectorAll('img')) {
    const url = img.getAttribute('src') ?? '';
    const local = url ? await localImage(slug, url) : null;
    if (!local) { img.remove(); continue; }
    replace(img, block(`![${mdEscapeAlt(img.getAttribute('alt') ?? '')}](${local})`));
  }

  // Buttons → styled link (kept as raw HTML, .prose a.button in global.css).
  for (const n of root.querySelectorAll('.button-wrapper')) {
    const a = n.querySelector('a');
    if (!a) { n.remove(); continue; }
    replace(n, block(`<p><a class="button" href="${cleanUrl(a.getAttribute('href') ?? '#')}">${esc(a.text)}</a></p>`));
  }

  // Pull quotes → blockquote.
  for (const n of root.querySelectorAll('.pullquote')) replace(n, `<blockquote>${n.innerHTML}</blockquote>`);

  // Footnotes: anchors → [^n], footnote blocks → [^n]: text
  const footnotes = [];
  for (const n of root.querySelectorAll('.footnote')) {
    const num = esc(n.querySelector('.footnote-number')?.text ?? String(footnotes.length + 1)).replace(/\D/g, '') || String(footnotes.length + 1);
    const content = n.querySelector('.footnote-content');
    const text = content ? turndown.turndown(content.innerHTML).replace(/\n+/g, ' ').trim() : esc(n.text);
    footnotes.push(`[^${num}]: ${text}`);
    n.remove();
  }
  for (const a of root.querySelectorAll('a.footnote-anchor')) {
    const num = esc(a.text).replace(/\D/g, '');
    replace(a, `@@FN${num}@@`);
  }

  // Unwrap image links and h1 → h2.
  for (const a of root.querySelectorAll('a.image-link')) replace(a, a.innerHTML);
  for (const h of root.querySelectorAll('h1')) replace(h, `<h2>${h.innerHTML}</h2>`);

  let md = turndown.turndown(root.toString());
  md = md.replace(/@@BLOCK(\d+)@@/g, (_, i) => blocks[Number(i)]).replace(/\\@@FN(\d+)\\?@@/g, '[^$1]').replace(/@@FN(\d+)@@/g, '[^$1]');
  md = md.replace(/\\([*_~[\]#])/g, (m, c) => (c === '*' || c === '_' ? m : c));
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  // Sign-off ("Alexej", "*Alexej*") → handwriting (.prose .signature in global.css). Only spaces
  // before the line end: `\s*` would eat the blank line after it, and Markdown would then render
  // the next paragraph as raw text inside the HTML block.
  md = md.replace(/^\*?(?:Dein |Euer |Your )?Alexej\*?[ \t]*$/gm, '<p class="signature">Alexej</p>');
  if (footnotes.length) md += '\n\n' + footnotes.join('\n');
  return { md, notes };
}

// ---------- main ----------
const files = readdirSync(join(SRC, 'posts')).filter(f => f.endsWith('.json') && !f.endsWith('.preload.json'));
mkdirSync(OUT_MD, { recursive: true });
const summary = [];
for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  if (only.length && !only.includes(slug)) continue;
  if (SKIP.includes(slug)) continue;
  const post = JSON.parse(readFileSync(join(SRC, 'posts', file), 'utf8'));
  const meta = index.find(p => p.slug === slug) ?? {};
  const target = join(OUT_MD, `${slug}.md`);
  if (existsSync(target) && /^imported:\s*false/m.test(readFileSync(target, 'utf8'))) { console.log(`skip ${slug} (imported: false)`); continue; }

  const tags = [];
  for (const t of post.postTags ?? []) if (TAG_SLUGS[t.slug]) tags.push(TAG_SLUGS[t.slug]);
  if (/english/i.test(meta.section_name ?? '') && !tags.includes('english-only')) tags.unshift('english-only');
  if (!tags.length && TAG_SUGGESTIONS[slug]) tags.push(...TAG_SUGGESTIONS[slug]);
  const lang = tags.includes('english-only') ? 'en' : 'de';

  const { md, notes } = await convertPost(slug, post);
  const coverUrl = post.cover_image ?? meta.cover_image;
  const cover = coverUrl ? await localImage(slug, coverUrl) : null;
  if (coverUrl && !cover) notes.push('cover missing');

  const fm = {
    title: esc(post.title),
    subtitle: esc(post.subtitle ?? ''),
    date: post.post_date,
    lang,
    tags,
    ...(cover && { cover, coverAlt: '' }),
    substackId: post.id,
    ...(post.type === 'page' && { page: true }),
  };
  const doc = `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n\n${md}\n`;
  writeFileSync(target, doc);
  const words = countWords(md);
  summary.push({ slug, words, substackWords: meta.wordcount ?? null, tags, cover: Boolean(cover), notes });
  console.log(`${slug}: ${words} Wörter${meta.wordcount ? ` (Substack ${meta.wordcount})` : ''}, tags ${tags.join(',') || '-'}${notes.length ? ' | ' + notes.join('; ') : ''}`);
}
mkdirSync('migration', { recursive: true });
writeFileSync('migration/import-summary.json', JSON.stringify(summary, null, 2));
const noTags = summary.filter(s => !s.tags.length).map(s => s.slug);
const off = summary.filter(s => s.substackWords && Math.abs(s.words - s.substackWords) / s.substackWords > 0.15);
console.log(`\n${summary.length} Posts konvertiert. Ohne Tag: ${noTags.length} (${noTags.join(', ')}). Wortzahl weicht >15 % ab: ${off.map(s => `${s.slug} (${s.words}/${s.substackWords})`).join(', ') || 'keine'}`);
