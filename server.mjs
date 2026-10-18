// Production server (Replit Autoscale): Express serves the prerendered pages and assets with
// compression, cache and security headers; everything else (API routes, redirects, 404) goes to
// the Astro handler (@astrojs/node in middleware mode).
import compression from 'compression';
import express from 'express';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { handler as astro } from './dist/server/entry.mjs';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(compression());

// Canonical host: apex → www before any file is served. Paths that are not a built file (old
// Substack URLs, /p/<slug>/comments, trailing slashes) go to the Astro middleware instead, which
// redirects them to the final www URL in one step.
const APEX = 'beyondbacklog.de';
const isBuiltFile = path => {
  let file;
  try {
    file = join('dist/client', decodeURIComponent(path === '/' ? '/index.html' : path));
  } catch {
    return false;
  }
  return file.startsWith('dist/client') && [file, `${file}.html`].some(f => existsSync(f) && statSync(f).isFile());
};
const isApex = req => String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0].trim().split(':')[0] === APEX;
app.use((req, res, next) => {
  if (!isApex(req)) return next();
  // Same normalization as normalizePath in src/lib/redirects.ts: no duplicate or trailing slashes.
  const collapsed = req.path.replace(/\/{2,}/g, '/');
  const path = collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
  const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  if (isBuiltFile(path)) return res.redirect(301, `https://www.${APEX}${path}${query}`);
  // Astro would answer a trailing slash with its own redirect on the apex host first.
  req.url = path + query;
  next();
});
const unlessApex = middleware => (req, res, next) => (isApex(req) ? next() : middleware(req, res, next));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Hashed build output may be cached forever; pages for a few minutes (fresh after each deploy anyway).
app.use('/_astro', unlessApex(express.static('dist/client/_astro', { immutable: true, maxAge: '1y', fallthrough: false })));
app.use(
  unlessApex(express.static('dist/client', {
    extensions: ['html'],
    redirect: false,
    setHeaders(res, path) {
      if (path.endsWith('.html')) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      else if (/\.(xml|txt|ico|png|jpg|pdf)$/.test(path)) res.setHeader('Cache-Control', 'public, max-age=3600');
    },
  })),
);
app.use(astro);

const port = Number(process.env.PORT ?? 4321);
const host = process.env.HOST ?? '0.0.0.0';
app.listen(port, host, () => console.log(`beyondbacklog.de listening on http://${host}:${port}`));
