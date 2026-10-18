// Central site data. Use these instead of hardcoding addresses in components.
export const site = {
  name: 'Beyond Backlog',
  /** Canonical origin (www, no trailing slash). */
  url: 'https://www.beyondbacklog.de',
  tagline: 'Über digitale Produktentwicklung & Künstliche Intelligenz.',
  description: 'Erfahrungen und Learnings aus 20 Jahren agiler Produktentwicklung. Newsletter und Blog von Alexej Antropov.',
  author: 'Alexej Antropov',
  location: 'Rosenheim',
  contactEmail: 'alexej@beyondbacklog.de',
  linkedinUrl: 'https://www.linkedin.com/in/alexejantropov/',
  personalSiteUrl: 'https://alexejantropov.de',
  workWithMeUrl: '/p/work-with-me',
  firstYear: 2019,
  /** Tags shown in the navigation and as filters, in this order. */
  tags: [
    { slug: 'ki', label: 'KI', lang: 'de', intro: 'KI-Radar, Tools in der Praxis, UX Research mit KI und die Frage, was KI mit Produktteams macht.' },
    { slug: 'product', label: 'Product', lang: 'de', intro: 'Product Sense, Prioritäten, Vertrauen im Team und das agile Produkt-Mindset.' },
    { slug: 'english-only', label: 'English Only', lang: 'en', intro: 'The most important posts and resources, published separately in English.' },
  ],
} as const;

export type TagSlug = (typeof site.tags)[number]['slug'];
/** Tag slugs for the content schema (z.enum needs a non-empty tuple). */
export const tagSlugs = site.tags.map(t => t.slug) as [TagSlug, ...TagSlug[]];

/** Default sender of all mails (MAIL_FROM overrides it). */
export const mailFrom = `${site.author} <${site.contactEmail}>`;

export const tagLabel = (slug: string): string => site.tags.find(t => t.slug === slug)?.label ?? slug;
