// schema.org JSON-LD: the website/person on the homepage, BlogPosting on every post.
import { site } from '../data/site';

type JsonLd = Record<string, unknown>;

export function person(siteUrl: string): JsonLd {
  return {
    '@type': 'Person',
    name: site.author,
    url: new URL('/about', siteUrl).href,
    email: site.contactEmail,
    sameAs: [site.linkedinUrl, site.personalSiteUrl],
  };
}

export function website(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    description: site.tagline,
    url: new URL('/', siteUrl).href,
    inLanguage: 'de',
    author: person(siteUrl),
  };
}

export function blogPosting(
  siteUrl: string,
  { title, description, date, image, url, lang }: { title: string; description: string; date: Date; image?: string | null; url: string; lang: 'de' | 'en' },
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date.toISOString(),
    ...(image && { image: new URL(image, siteUrl).href }),
    url,
    mainEntityOfPage: url,
    inLanguage: lang,
    author: person(siteUrl),
    publisher: { '@type': 'Person', name: site.author, url: new URL('/', siteUrl).href },
  };
}

export function breadcrumbs(siteUrl: string, items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: new URL(item.path, siteUrl).href })),
  };
}

/** JSON for a <script type="application/ld+json">; "<" is escaped so text can't close the tag. */
export function toJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
