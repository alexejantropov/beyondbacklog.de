// All redirects of the site, in one place (migration.md, section 4.3). Applied at runtime by
// src/middleware.ts (real 301s from the Node server) and verified after every build by
// scripts/check-dist.mjs: every target exists, no source shadows a page, no chains, and every
// URL in tests/legacy-urls.txt resolves. Rules: permanent by default; first match wins; `*`
// matches the rest of the path and is available as :splat in `to`.
import type { Redirect } from '../lib/redirects';

export const redirects: Redirect[] = [
  // --- Substack paths that are not pages here -------------------------------------------------
  { from: '/feed', to: '/feed.xml' },
  { from: '/rss', to: '/feed.xml' },
  { from: '/rss.xml', to: '/feed.xml' },
  { from: '/sitemap.xml', to: '/sitemap-index.xml' },
  { from: '/subscribe', to: '/newsletter' },
  { from: '/welcome', to: '/newsletter' },
  { from: '/embed', to: '/newsletter' },
  { from: '/archive', to: '/beitraege' },
  { from: '/notes', to: '/' },
  { from: '/recommendations', to: '/' },
  { from: '/podcast', to: '/' },
  { from: '/chat', to: '/' },
  { from: '/leaderboard', to: '/' },
  { from: '/publish/*', to: '/' },
  { from: '/account/*', to: '/' },
  { from: '/sign-in', to: '/' },
  // English posts live at /s/english-only.
  { from: '/p/how-to-get-english-only-posts', to: '/s/english-only' },
  // /p/<slug>/comments and other sub-pages of a post → the post: handled by collapsePostPath
  // in src/lib/redirects.ts (no rule needed).
];
