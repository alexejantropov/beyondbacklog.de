// Runtime redirects (Node server on Replit): canonical host, no trailing slash, Substack paths
// (src/data/redirects.ts), /p/<slug>/comments → /p/<slug>. Prerendered pages are served as files
// by express.static in server.mjs before this runs; everything else (unknown paths, the on-demand
// 404 page and the API routes) passes through here.
import { defineMiddleware } from 'astro:middleware';
import { redirects } from './data/redirects';
import { site } from './data/site';
import { collapsePostPath, normalizePath, resolveRedirect } from './lib/redirects';

const CANONICAL_HOST = new URL(site.url).host;

export const onRequest = defineMiddleware((context, next) => {
  // Prerendered pages are built once; only live requests (API, unknown paths) get redirects.
  if (context.isPrerendered) return next();
  const url = new URL(context.request.url);
  const headers = context.request.headers;
  const host = (headers.get('x-forwarded-host') ?? headers.get('host') ?? url.host).split(',')[0].trim().split(':')[0];
  // Apex → www (only the production host, never previews/localhost). server.mjs redirects apex
  // requests for built files itself; the rest arrives here and gets one redirect to the final URL.
  const apex = host === CANONICAL_HOST.replace(/^www\./, '');

  // 308 keeps the method: a POST to the apex host stays a POST (301 would turn it into a GET).
  if (url.pathname.startsWith('/api/')) return apex ? Response.redirect(`${site.url}${url.pathname}${url.search}`, 308) : next();

  const normalized = collapsePostPath(normalizePath(url.pathname));
  const hit = resolveRedirect(normalized, redirects);
  // Rule targets drop the query; a normalized path keeps it.
  const target = hit ? hit.target : normalized + url.search;
  if (apex) return Response.redirect(`${site.url}${target}`, hit?.rule.status ?? 301);
  if (normalized !== url.pathname) return context.redirect(normalized + url.search, 301);
  if (hit) return context.redirect(hit.target, hit.rule.status ?? 301);

  return next();
});
