// Content rules for src/content/posts: every Substack URL has a post, frontmatter is complete,
// posts carry a tag, images are referenced via ~/assets and exist, no Substack leftovers.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readLegacy } from '../scripts/lib/legacy-urls.mjs';

const dir = 'src/content/posts';
const files = readdirSync(dir).filter(f => f.endsWith('.md'));
const legacy = readLegacy().filter(l => !l.gone && l.path.startsWith('/p/') && !l.path.includes('/comments')).map(l => l.path);
const frontmatter = (file: string) => readFileSync(`${dir}/${file}`, 'utf8').split('---')[1] ?? '';
const body = (file: string) => readFileSync(`${dir}/${file}`, 'utf8').split('---').slice(2).join('---');
const withoutComments = (text: string) => text.replace(/<!--[\s\S]*?-->/g, '');

describe('posts', () => {
  it('exist for every Substack /p/ URL', () => {
    for (const path of legacy) expect(existsSync(`${dir}/${path.slice(3)}.md`) || existsSync(`src/pages/p/${path.slice(3)}.astro`), path).toBe(true);
  });
  it('have title, date and (unless a page) a tag and an eyebrow', () => {
    for (const file of files) {
      const fm = frontmatter(file);
      expect(fm, file).toMatch(/^title: .+/m);
      expect(fm, file).toMatch(/^date: \d{4}-\d{2}-\d{2}/m);
      if (!/^page: true/m.test(fm)) {
        expect(fm, file).toMatch(/^tags:\n {2}- /m);
        const eyebrow = fm.match(/^eyebrow:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
        const words = eyebrow.split(/\s+/).filter(Boolean);
        expect(words.length, `${file} eyebrow`).toBeGreaterThan(0);
        expect(words.length, `${file} eyebrow "${eyebrow}"`).toBeLessThanOrEqual(3);
      }
    }
  });
  it('reference images only via ~/assets and those files exist', () => {
    for (const file of files) {
      const text = withoutComments(readFileSync(`${dir}/${file}`, 'utf8'));
      for (const m of text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        expect(m[1], `${file}: ${m[1]}`).toMatch(/^~\/assets\//);
        expect(existsSync(m[1].replace('~/assets/', 'src/assets/')), `${file}: ${m[1]}`).toBe(true);
      }
      expect(text, file).not.toMatch(/substackcdn\.com|<img /);
    }
  });
  it('contain no Substack widgets or tracking links', () => {
    for (const file of files) {
      const text = body(file);
      expect(text, file).not.toMatch(/subscription-widget|paywall|utm_source=|beyondbacklog\.substack\.com/);
    }
  });
});
