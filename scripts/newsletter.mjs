// Creates a Resend broadcast draft from a post (migration.md, section 6.4):
//   npm run newsletter -- <slug> [--intro "Kurzer Hinweis am Anfang"] [--send]
// Takes the post body from the built page (dist/client/p/<slug>.html) with absolute URLs, wraps it
// in the issue template (src/email/templates.ts) and creates the broadcast in the newsletter
// segment. Without --send it stays a draft: review and send it in the Resend dashboard (test mail
// first). Needs a built site (npm run build; aborts if an image is missing there) and .env with
// RESEND_API_KEY, RESEND_SEGMENT_ID, MAIL_FROM.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Resend } from 'resend';
import YAML from 'yaml';
import { parse } from 'node-html-parser';
import { mailFrom, site } from '../src/data/site.ts';
import { issueMail, styleIssueBody } from '../src/email/templates.ts';
import { formatDate } from '../src/lib/seo.ts';

const args = process.argv.slice(2);
const valueFlags = new Set(['--intro']);
const slug = args.find((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));
if (!slug) { console.error('Usage: npm run newsletter -- <slug> [--intro "…"] [--send]'); process.exit(2); }
const intro = args.includes('--intro') ? args[args.indexOf('--intro') + 1] : undefined;
const send = args.includes('--send');
if (existsSync('.env')) process.loadEnvFile('.env');
const get = k => process.env[k];
const SITE = (get('SITE_URL') || site.url).replace(/\/$/, '');

const file = `src/content/posts/${slug}.md`;
if (!existsSync(file)) { console.error(`${file} not found`); process.exit(2); }
const fm = YAML.parse(readFileSync(file, 'utf8').split('---')[1]);

// Body = the .prose block of the built page: images exactly as the site serves them (Astro emits
// only optimized variants and may name a file after an identical one), comments already gone.
const page = `dist/client/p/${slug}.html`;
if (!existsSync(page)) { console.error(`${page} fehlt: erst npm run build`); process.exit(2); }
const doc = parse(readFileSync(page, 'utf8'));
const prose = doc.querySelector('.prose');
if (!prose) { console.error(`${page}: kein .prose-Block`); process.exit(1); }
const absolute = url => (url.startsWith('/') && !url.startsWith('//') ? `${SITE}${url}` : url);
const missing = [];
for (const img of prose.querySelectorAll('img')) {
  const src = img.getAttribute('src') ?? '';
  if (src.startsWith('/') && !existsSync(`dist/client${decodeURI(src.split('?')[0])}`)) missing.push(src);
  img.setAttribute('src', absolute(src));
  for (const attr of Object.keys(img.attributes)) if (/^(srcset|sizes|loading|decoding|data-.*)$/.test(attr)) img.removeAttribute(attr);
}
for (const a of prose.querySelectorAll('a[href]')) a.setAttribute('href', absolute(a.getAttribute('href')));
if (missing.length) {
  console.error(`✗ ${missing.length} Bild(er) aus ${page} fehlen in dist/client, nichts geschrieben:`);
  for (const src of missing) console.error(`    ${src}`);
  process.exit(1);
}
const bodyHtml = styleIssueBody(prose.innerHTML);
const date = formatDate(new Date(fm.date));
// Cover: the page's social preview (og:image, 1200×630), already absolute.
const og = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
const coverUrl = fm.cover && og ? og.replace(/^https?:\/\/[^/]+/, SITE) : undefined;
const mail = issueMail({ title: fm.title, subtitle: fm.subtitle, date, url: `${SITE}/p/${slug}`, bodyHtml, coverUrl, intro });

mkdirSync('migration/newsletter', { recursive: true });
writeFileSync(`migration/newsletter/${slug}.html`, mail);
console.log(`E-Mail-HTML geschrieben: migration/newsletter/${slug}.html`);

if (!get('RESEND_API_KEY') || !get('RESEND_SEGMENT_ID')) { console.log('RESEND_API_KEY / RESEND_SEGMENT_ID fehlen: kein Broadcast angelegt (HTML kann in Resend eingefügt werden).'); process.exit(0); }
const resend = new Resend(get('RESEND_API_KEY'));
const { data, error } = await resend.broadcasts.create({
  segmentId: get('RESEND_SEGMENT_ID'),
  from: get('MAIL_FROM') ?? mailFrom,
  replyTo: site.contactEmail,
  subject: fm.title,
  name: `${slug} (${new Date().toISOString().slice(0, 10)})`,
  html: mail,
  ...(get('RESEND_TOPIC_ID') && { topicId: get('RESEND_TOPIC_ID') }),
  ...(send && { send: true }),
});
if (error) { console.error('Resend:', error.message); process.exit(1); }
console.log(`${send ? 'Broadcast gesendet' : 'Broadcast-Entwurf angelegt'}: id ${data.id}. Dashboard: https://resend.com/broadcasts`);
