// Responsive check (migration.md, step 5): every page must work from 360 px to 1920 px.
// Loads routes on a device matrix (phones/tablets in WebKit, desktops in Chromium),
// runs automated checks and saves full-page screenshots for the visual review.
//
//   npm run build && npm run check:responsive -- / /team        explicit routes
//   npm run check:responsive -- --all                            every route in tests/routes.snapshot.txt
//   options: --devices phone,tablet,desktop|<device id>  --firefox
//            --zoom (adds zoom-200: 1280px at 200% browser zoom = 640px viewport, WCAG 1.4.4)
//            --base <url> (skip the built-in preview server)  --out <dir>  --no-screenshots
//
// Errors (exit code 1): horizontal overflow, elements past the viewport edge, tap targets
// under 24px (WCAG 2.5.8), text under 11px, broken images, console errors, failed requests,
// Google Fonts requests. Warnings: tap targets under 44px and body text under 16px on
// touch devices, layout shift (CLS) over 0.1 where the engine reports it.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, devices, firefox, webkit } from 'playwright';
import { startPreviewServer } from './lib/preview-server.mjs';

const DEVICES = [
  { id: 'phone-360', group: 'phone', engine: 'chromium', descriptor: 'Galaxy S8' },
  { id: 'iphone-390', group: 'phone', engine: 'webkit', descriptor: 'iPhone 14' },
  { id: 'iphone-430', group: 'phone', engine: 'webkit', descriptor: 'iPhone 14 Pro Max' },
  { id: 'iphone-landscape', group: 'landscape', engine: 'webkit', descriptor: 'iPhone 14 landscape' },
  { id: 'ipad-portrait', group: 'tablet', engine: 'webkit', descriptor: 'iPad Mini' },
  { id: 'ipad-landscape', group: 'tablet', engine: 'webkit', descriptor: 'iPad Mini landscape' },
  { id: 'laptop-1280', group: 'desktop', engine: 'chromium', viewport: { width: 1280, height: 800 } },
  { id: 'desktop-1440', group: 'desktop', engine: 'chromium', viewport: { width: 1440, height: 900 } },
  { id: 'wide-1920', group: 'desktop', engine: 'chromium', viewport: { width: 1920, height: 1080 } },
  { id: 'zoom-200', group: 'zoom', engine: 'chromium', viewport: { width: 640, height: 450 } },
  { id: 'firefox-1440', group: 'firefox', engine: 'firefox', viewport: { width: 1440, height: 900 } },
];
const ENGINES = { chromium, webkit, firefox };
const FORBIDDEN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// Noise: aborted requests (navigation, lazy images) and CSP report-only messages.
const IGNORED_FAILURES = /net::ERR_ABORTED|NS_BINDING_ABORTED|cancelled|\[Report Only\]/i;
const PORT = 4329;
const CONCURRENCY = 6;

// ---------- arguments ----------
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const option = name => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const optionValues = new Set(['--devices', '--base', '--out'].map(option).filter(Boolean));
let routes = args.filter(a => !a.startsWith('--') && !optionValues.has(a));
if (flag('--all')) {
  routes = (await readFile('tests/routes.snapshot.txt', 'utf8')).split('\n').filter(Boolean);
}
if (!routes.length) {
  console.error('No routes given. Pass routes (e.g. / /team) or --all.');
  process.exit(2);
}
const wanted = (option('--devices') ?? 'phone,landscape,tablet,desktop').split(',');
const deviceList = DEVICES.filter(
  d => (wanted.includes(d.group) || wanted.includes(d.id)) && (d.engine !== 'firefox' || flag('--firefox') || wanted.includes(d.id)),
);
if (flag('--firefox') && !deviceList.some(d => d.engine === 'firefox')) deviceList.push(DEVICES.at(-1));
if (flag('--zoom') && !deviceList.some(d => d.group === 'zoom')) deviceList.push(DEVICES.find(d => d.group === 'zoom'));
const outDir = option('--out') ?? join('.responsive', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
const screenshots = !flag('--no-screenshots');

// ---------- preview server ----------
const base = option('--base') ?? (await startPreviewServer(PORT));
process.on('SIGINT', () => process.exit(130));

// ---------- in-page checks ----------
// Runs in the browser. Kept self-contained (no closures over Node values).
function inspectPage({ touch, phone }) {
  const vw = document.documentElement.clientWidth;
  const errors = [];
  const warnings = [];
  const describe = el => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
      : '';
    const label = el.innerText || el.getAttribute('aria-label') || el.querySelector?.('img[alt], svg[aria-label]')?.getAttribute('alt') || el.querySelector?.('svg[aria-label]')?.getAttribute('aria-label') || '';
    const text = label.trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ''}`;
  };
  const visible = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // Ancestor (below html/body) that clips horizontal overflow, e.g. a marquee or carousel.
  const clipper = el => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o !== 'visible') return p;
    }
    return null;
  };

  // 1. horizontal overflow
  const scrollW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (scrollW > vw + 1) errors.push({ type: 'overflow', msg: `page scrolls horizontally (${scrollW}px > ${vw}px)` });
  const offenders = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right <= vw + 1 && r.left >= -1) continue;
    if (clipper(el)) continue;
    if (el.parentElement && offenders.includes(el.parentElement)) continue;
    offenders.push(el);
  }
  for (const el of offenders.slice(0, 5)) {
    const r = el.getBoundingClientRect();
    errors.push({ type: 'off-screen', msg: `${describe(el)} spans ${Math.round(r.left)}–${Math.round(r.right)}px (viewport ${vw}px)` });
  }
  // Text that does not wrap (long words, URLs, e-mail addresses) overflows its own box
  // while the box itself stays inside the viewport.
  const textOverflow = [];
  for (const el of document.body.querySelectorAll('p, li, a, span, h1, h2, h3, h4, td, th, dd, dt, blockquote, code')) {
    if (!visible(el) || clipper(el)?.contains(el) === false) continue;
    if (getComputedStyle(el).overflowX !== 'visible' || el.scrollWidth <= el.clientWidth + 1 || !el.clientWidth) continue;
    if (el.getBoundingClientRect().left + el.scrollWidth <= vw + 1) continue;
    if (textOverflow.some(o => o.contains(el))) continue;
    textOverflow.push(el);
  }
  for (const el of textOverflow.slice(0, 5)) {
    errors.push({ type: 'text-overflow', msg: `${describe(el)} content is ${el.scrollWidth}px wide in a ${el.clientWidth}px box` });
  }

  // 2. tap targets. WCAG 2.5.8: a target under 24×24px still passes if a 24px circle
  // around its centre touches no other target (and no other undersized target's circle).
  // Visually hidden controls (e.g. sr-only radios styled through their <label>) are not tap
  // targets themselves; the label is.
  const srOnly = el => {
    const r = el.getBoundingClientRect();
    return r.width <= 1 && r.height <= 1;
  };
  const targets = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]')]
    .filter(el => visible(el) && !srOnly(el) && !(getComputedStyle(el).display === 'inline' && el.closest('p, li, .prose, blockquote, td')))
    .map(el => ({ el, r: el.getBoundingClientRect() }));
  const centre = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const distToRect = (p, r) => Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
  const small = targets.filter(t => Math.min(t.r.width, t.r.height) < 24);
  for (const t of targets) {
    const { el, r } = t;
    const size = `${Math.round(r.width)}×${Math.round(r.height)}px`;
    if (small.includes(t)) {
      const c = centre(r);
      const crowded = targets.some(o => o !== t && !o.el.contains(el) && !el.contains(o.el) && (
        distToRect(c, o.r) < 12 || (small.includes(o) && Math.hypot(c.x - centre(o.r).x, c.y - centre(o.r).y) < 24)));
      if (crowded) errors.push({ type: 'tap-target', msg: `${describe(el)} is ${size}, under 24px and too close to another target` });
      else if (touch) warnings.push({ type: 'tap-target', msg: `${describe(el)} is ${size} (< 44px)` });
    } else if (touch && Math.min(r.width, r.height) < 44) {
      warnings.push({ type: 'tap-target', msg: `${describe(el)} is ${size} (< 44px)` });
    }
  }

  // 3. font sizes
  const tiny = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || !visible(el) || el.closest('svg, [aria-hidden=true]')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 11) tiny.add(`${describe(el)} ${size}px`);
  }
  for (const t of [...tiny].slice(0, 5)) errors.push({ type: 'font-size', msg: `text under 11px: ${t}` });
  if (phone) {
    const small = [...document.querySelectorAll('main p')]
      .filter(p => visible(p) && p.innerText.trim().length > 80 && parseFloat(getComputedStyle(p).fontSize) < 16)
      .map(p => `${describe(p)} ${getComputedStyle(p).fontSize}`);
    for (const s of small.slice(0, 3)) warnings.push({ type: 'body-text', msg: `body text under 16px on phone: ${s}` });
  }

  // 4. images
  for (const img of document.images) {
    if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) {
      errors.push({ type: 'image', msg: `broken image ${img.currentSrc || img.getAttribute('src')}` });
    }
  }

  return { errors, warnings, cls: window.__vrCls ?? null, height: document.documentElement.scrollHeight };
}

// ---------- run ----------
const fileName = route => (route === '/' ? 'index' : route.slice(1).replace(/\//g, '__'));
const report = { base, startedAt: new Date().toISOString(), routes, devices: deviceList.map(d => d.id), results: [] };

async function checkRoute(context, device, route) {
  const page = await context.newPage();
  const errors = [];
  const warnings = [];
  // Only judge our own page: requests and console output of embedded iframes (e.g. YouTube) are ignored.
  const ownFrame = frame => !frame || frame === page.mainFrame();
  page.on('console', m => {
    const fromOwnPage = (m.location()?.url ?? '').startsWith(base) || !m.location()?.url;
    if (m.type() === 'error' && fromOwnPage && !IGNORED_FAILURES.test(m.text())) errors.push({ type: 'console', msg: m.text().slice(0, 200) });
  });
  page.on('pageerror', e => errors.push({ type: 'console', msg: `pageerror: ${e.message.slice(0, 200)}` }));
  const frameOf = r => {
    try {
      return r.frame();
    } catch {
      return null; // service-worker requests have no frame
    }
  };
  page.on('request', r => {
    if (ownFrame(frameOf(r)) && FORBIDDEN_HOSTS.some(h => r.url().includes(h))) errors.push({ type: 'forbidden-host', msg: `request to ${r.url()}` });
  });
  page.on('requestfailed', r => {
    const why = r.failure()?.errorText ?? '';
    if (ownFrame(frameOf(r)) && !IGNORED_FAILURES.test(`${r.url()} ${why}`)) errors.push({ type: 'request', msg: `${r.url()} ${why}` });
  });
  page.on('response', r => {
    if (r.status() >= 400 && ownFrame(frameOf(r.request())) && !IGNORED_FAILURES.test(r.url())) errors.push({ type: 'request', msg: `${r.status()} ${r.url()}` });
  });

  try {
    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    errors.push({ type: 'load', msg: e.message.split('\n')[0] });
  }
  // Scroll through the page so lazy images load, then return to the top.
  await page.evaluate(async () => {
    // behavior 'instant': the site uses scroll-behavior: smooth, and measuring while the page
    // is still animating back to the top would report positions mid-scroll.
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 100));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  // Lazy images that started loading while scrolling must finish before checks and screenshot.
  await page
    .waitForFunction(() => [...document.images].every(img => img.complete), null, { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(300);

  const touch = Boolean(device.touch);
  const result = await page.evaluate(inspectPage, { touch, phone: device.group === 'phone' }).catch(e => ({
    errors: [{ type: 'inspect', msg: e.message.split('\n')[0] }], warnings: [], cls: null, height: 0,
  }));
  errors.push(...result.errors);
  warnings.push(...result.warnings);
  if (result.cls != null && result.cls > 0.1) warnings.push({ type: 'cls', msg: `layout shift ${result.cls.toFixed(3)}` });

  let screenshot = null;
  if (screenshots) {
    // Full-page captures resize the viewport; make sure every image is loaded and decoded so
    // the screenshot shows what a user sees after scrolling (harness only, not a page change).
    await page
      .evaluate(async () => {
        const imgs = [...document.images];
        for (const img of imgs) {
          img.loading = 'eager';
          img.decoding = 'sync';
        }
        await Promise.all(imgs.map(img => img.decode().catch(() => {})));
      })
      .catch(() => {});
    screenshot = join(outDir, device.id, `${fileName(route)}.jpg`);
    await mkdir(join(outDir, device.id), { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: true, scale: 'css', type: 'jpeg', quality: 70 }).catch(e => {
      warnings.push({ type: 'screenshot', msg: e.message.split('\n')[0] });
      screenshot = null;
    });
  }
  await page.close();
  return { device: device.id, route, errors, warnings, cls: result.cls, height: result.height, screenshot };
}

for (const device of deviceList) {
  const browser = await ENGINES[device.engine].launch();
  const descriptor = device.descriptor ? devices[device.descriptor] : {};
  device.touch = Boolean(descriptor.hasTouch);
  const context = await browser.newContext({ ...descriptor, ...(device.viewport ? { viewport: device.viewport } : {}) });
  // CLS where supported (Chromium); WebKit/Firefox report null.
  await context.addInitScript(() => {
    try {
      window.__vrCls = 0;
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vrCls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      window.__vrCls = null;
    }
  });
  const queue = [...routes];
  const started = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (let r = queue.shift(); r; r = queue.shift()) report.results.push(await checkRoute(context, device, r));
  }));
  await browser.close();
  const mine = report.results.filter(r => r.device === device.id);
  const e = mine.reduce((n, r) => n + r.errors.length, 0);
  const w = mine.reduce((n, r) => n + r.warnings.length, 0);
  console.log(`${e ? '✗' : '✓'} ${device.id.padEnd(17)} ${String(mine.length).padStart(3)} routes  ${String(e).padStart(4)} errors  ${String(w).padStart(4)} warnings  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
}

// ---------- summary ----------
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 1));
const tally = kind => {
  const counts = new Map();
  for (const r of report.results) {
    for (const item of r[kind]) {
      // Group by message, ignoring the measured sizes (thresholds like "< 44px" stay readable).
      const key = `${item.type}: ${item.msg.replace(/\d+×\d+px/g, 'W×Hpx').replace(/ \d+(\.\d+)?px$/, '').replace(base, '')}`;
      const entry = counts.get(key) ?? { n: 0, where: new Set() };
      entry.n++;
      entry.where.add(`${r.device} ${r.route}`);
      counts.set(key, entry);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
};
const errorsByType = tally('errors');
const warningsByType = tally('warnings');
const show = (title, list) => {
  if (!list.length) return;
  console.log(`\n${title}`);
  for (const [msg, { n, where }] of list.slice(0, 25)) {
    const sample = [...where].slice(0, 2).join(', ');
    console.log(`  ${String(n).padStart(4)}× ${msg.slice(0, 140)}  [${sample}${where.size > 2 ? `, +${where.size - 2}` : ''}]`);
  }
};
show('Errors', errorsByType);
show('Warnings', warningsByType);
const totalErrors = report.results.reduce((n, r) => n + r.errors.length, 0);
console.log(`\nReport and screenshots: ${outDir}`);
process.exit(totalErrors ? 1 : 0);
