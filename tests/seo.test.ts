import { describe, expect, it } from 'vitest';
import { countWords, formatDate, isLegalPath, isNoindexPath, readingTime, toMetaDescription } from '../src/lib/seo';
import { strokeStyle } from '../src/lib/stroke';
import { blogPosting, toJsonLd } from '../src/lib/structuredData';

describe('seo helpers', () => {
  it('shortens meta descriptions at a word boundary', () => {
    const long = 'Wort '.repeat(60).trim();
    const d = toMetaDescription(long);
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d.endsWith('…')).toBe(true);
    expect(toMetaDescription('  kurz   und gut ')).toBe('kurz und gut');
  });
  it('marks legal and helper pages, with or without trailing slash', () => {
    expect(isLegalPath('/impressum/')).toBe(true);
    expect(isLegalPath('/about')).toBe(false);
    expect(isNoindexPath('/newsletter-danke')).toBe(true);
    expect(isNoindexPath('/newsletter')).toBe(false);
    expect(isNoindexPath('/')).toBe(false);
  });
  it('computes reading time and German dates', () => {
    expect(readingTime(countWords('eins zwei drei'))).toBe(1);
    expect(readingTime(1000)).toBe(5);
    expect(formatDate(new Date('2025-10-13T17:02:51Z'))).toBe('13. Oktober 2025');
  });
  it('builds a pen stroke background without raw hashes', () => {
    const style = strokeStyle();
    expect(style.startsWith('background-image:url("data:image/svg+xml,')).toBe(true);
    expect(style).toContain('%23g');
    expect(style).not.toMatch(/url\(#g\)/);
  });
  it('escapes "<" in JSON-LD and dates posts', () => {
    const ld = blogPosting('https://www.beyondbacklog.de/', { title: 'A <b>', description: 'd', date: new Date('2025-01-01'), url: 'https://www.beyondbacklog.de/p/a', lang: 'de' });
    expect(toJsonLd(ld)).toContain('\\u003cb>');
    expect(ld.datePublished).toBe('2025-01-01T00:00:00.000Z');
  });
});
