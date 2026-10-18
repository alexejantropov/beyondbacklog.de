// Search engines show roughly 155–160 characters of a meta description.
export const META_DESCRIPTION_MAX = 160;

/** Collapses whitespace and shortens long texts at a word boundary, adding an ellipsis. */
export function toMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const lastSpace = clean.slice(0, max).lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? clean.slice(0, lastSpace) : clean.slice(0, max - 1);
  return `${cut.replace(/[\s,.;:–-]+$/, '')}…`;
}

/** "/x/" → "/x"; "/" stays. */
export const stripTrailingSlash = (path: string): string => path.replace(/(?<=.)\/$/, '');

/** Imprint and privacy policy: noindex and not in the sitemap. */
export const LEGAL_PATHS = ['/impressum', '/datenschutz'];
export const isLegalPath = (path: string): boolean => LEGAL_PATHS.includes(stripTrailingSlash(path));

/** Pages that exist for people, not for search engines. */
export const NOINDEX_PATHS = ['/newsletter-danke', '/newsletter-bestaetigt', '/newsletter-bestaetigen', '/newsletter-fehler', '/404'];
export const isNoindexPath = (path: string): boolean => NOINDEX_PATHS.includes(stripTrailingSlash(path));

/** Reading time in minutes (200 words per minute, at least 1). */
export const readingTime = (words: number): number => Math.max(1, Math.round(words / 200));

export const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/** German date, e.g. "13. Oktober 2025". */
export const formatDate = (date: Date, lang: 'de' | 'en' = 'de'): string =>
  date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Berlin' });
