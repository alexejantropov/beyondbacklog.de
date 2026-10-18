// Accessibility check: runs axe-core (WCAG 2.2 A/AA rules) on one route per page type, on a phone
// and a desktop viewport. Any violation exits with code 1.
//
//   npm run build && npm run check:a11y                    built-in preview server
//   npm run check:a11y -- --base http://127.0.0.1:4321    against a running server
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { startPreviewServer } from './lib/preview-server.mjs';

const ROUTES = [
  '/', '/s/ki', '/s/english-only', '/about', '/newsletter', '/newsletter-danke',
  '/p/just-product-2025-ein-abriss', '/p/product-tank-munich-orga-fitness-in-the-age-of-ai-tool-radar-web-product-development-dovetail-miro-juttu-claude-uizard',
  '/p/wie-ki-produktmanager-auf-ein-neues', '/p/work-with-me', '/impressum', '/datenschutz', '/404',
];
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1280, height: 800 },
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PORT = 4328;

const args = process.argv.slice(2);
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : await startPreviewServer(PORT);

const browser = await chromium.launch();
const failures = [];
for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch, reducedMotion: 'reduce' });
  for (const route of ROUTES) {
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const violation of results.violations) {
      for (const node of violation.nodes) {
        failures.push(`${viewport.name} ${route}: ${violation.id} (${violation.impact}) ${node.target.join(' ')} – ${violation.help}`);
      }
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

const group = list => Object.entries(list.reduce((m, e) => ((m[e.replace(/^\S+ \S+: /, '')] ??= []).push(e.split(':')[0]), m), {}));
console.log(`Checked ${ROUTES.length} routes × ${VIEWPORTS.length} viewports (${TAGS.join(', ')}).`);
if (failures.length) {
  console.log(`\nViolations: ${failures.length} nodes`);
  for (const [issue, where] of group(failures)) console.log(`  ${where.length}× ${issue}  [${[...new Set(where)].slice(0, 4).join(', ')}${where.length > 4 ? ', …' : ''}]`);
  process.exit(1);
}
console.log('\n✓ No accessibility violations');
// Exit explicitly: the preview server child would otherwise keep Node running (and the exit handler that stops it never fires).
process.exit(0);
