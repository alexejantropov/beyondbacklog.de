// Central site data. Use these instead of hardcoding addresses in components.
const authorRoles = 'Interim Product Manager, Co-Autor des Agile Product Manifesto, Lehrbeauftragter für KI-Projekte';

export const site = {
  name: 'Beyond Backlog',
  /** Canonical origin (www, no trailing slash). */
  url: 'https://www.beyondbacklog.de',
  tagline: 'Über digitale Produktentwicklung & Künstliche Intelligenz.',
  description: 'Erfahrungen und Learnings aus 20 Jahren agiler Produktentwicklung. Newsletter und Blog von Alexej Antropov.',
  author: 'Alexej Antropov',
  /** Roles in one line: About meta description, start of the bio. */
  authorRoles,
  /** Short bio: homepage closing and the author box under every post. */
  authorBio: `${authorRoles}. Hier teile ich, was in Produktteams wirklich funktioniert. Handwerk, Struktur, Tools statt Hype.`,
  location: 'Rosenheim',
  contactEmail: 'alexej@beyondbacklog.de',
  linkedinUrl: 'https://www.linkedin.com/in/alexejantropov/',
  personalSiteUrl: 'https://alexejantropov.de',
  workWithMeUrl: '/p/work-with-me',
  firstYear: 2019,
  /** Newsletter promise: /newsletter, the tinted box (second part with the pen stroke) and the inline sign-up. */
  newsletterClaim: { start: 'Neue Beiträge', highlight: 'direkt ins Postfach' },
} as const;

/** Default sender of all mails (MAIL_FROM overrides it). */
export const mailFrom = `${site.author} <${site.contactEmail}>`;
