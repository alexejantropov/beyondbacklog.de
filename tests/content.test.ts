// Content rules for src/content/posts: every Substack URL has a post, frontmatter is complete,
// posts carry an eyebrow, images are referenced via ~/assets, named after the post and exist, no Substack leftovers.
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
  it('have title, date and (unless a page) an eyebrow', () => {
    for (const file of files) {
      const fm = frontmatter(file);
      expect(fm, file).toMatch(/^title: .+/m);
      expect(fm, file).toMatch(/^date: \d{4}-\d{2}-\d{2}/m);
      if (!/^page: true/m.test(fm)) {
        const eyebrow = fm.match(/^eyebrow:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
        const words = eyebrow.split(/\s+/).filter(Boolean);
        expect(words.length, `${file} eyebrow`).toBeGreaterThan(0);
        expect(words.length, `${file} eyebrow "${eyebrow}"`).toBeLessThanOrEqual(3);
      }
    }
  });
  it('describe every cover image (coverAlt: alt text for cards, hero and the post)', () => {
    for (const file of files) {
      const fm = frontmatter(file);
      if (/^cover: /m.test(fm)) expect(fm, file).toMatch(/^coverAlt: ["']?[^"'\s]/m);
    }
  });
  it('reference images only via ~/assets, named after the post, and those files exist', () => {
    for (const file of files) {
      const text = withoutComments(readFileSync(`${dir}/${file}`, 'utf8'));
      const slug = file.replace(/\.md$/, '');
      const cover = frontmatter(file).match(/^cover: (\S+)/m)?.[1];
      for (const ref of [...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]).concat(cover ?? [])) {
        expect(ref, `${file}: ${ref}`).toMatch(/^~\/assets\//);
        expect(existsSync(ref.replace('~/assets/', 'src/assets/')), `${file}: ${ref}`).toBe(true);
        // File names carry the slug (SEO; the importer's assetStem()).
        if (ref.startsWith('~/assets/posts/')) expect(ref, `${file}: image name`).toMatch(new RegExp(`^~/assets/posts/${slug}/${slug}-`));
      }
      expect(text, file).not.toMatch(/substackcdn\.com|<img /);
    }
  });
  it('contain no Substack widgets or tracking links', () => {
    for (const file of files) {
      const text = body(file);
      expect(text, file).not.toMatch(/subscription-widget|paywall|utm_source=|beyondbacklog\.substack\.com|beyondbacklog@substack\.com/);
    }
  });
});
