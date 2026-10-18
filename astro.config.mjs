// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import { site } from './src/data/site.ts';
import { isLegalPath, isNoindexPath, stripTrailingSlash } from './src/lib/seo.ts';
import { postDates } from './src/lib/postDates.mjs';

// Beyond Backlog: static site (every page prerendered) served by the Node adapter on Replit
// Autoscale. Only src/pages/api/* and the 404 page are rendered on demand (newsletter sign-up,
// permanent redirects for old Substack URLs in src/middleware.ts). See CLAUDE.md.
const dates = postDates();

export default defineConfig({
  site: site.url,
  // Old Substack URLs have no trailing slash (/p/<slug>): keep them exactly.
  trailingSlash: 'never',
  build: { format: 'file' },
  output: 'static',
  adapter: node({ mode: 'middleware' }),
  markdown: { processor: unified() },
  image: { layout: 'constrained', breakpoints: [640, 1024, 1600, 2048] },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: page => {
        const path = stripTrailingSlash(new URL(page).pathname);
        return !isLegalPath(path) && !isNoindexPath(path);
      },
      serialize: item => {
        const url = item.url.replace(/(?<=[^/])\/$/, '');
        const slug = new URL(url).pathname.match(/^\/p\/(.+)$/)?.[1];
        const lastmod = slug ? dates[slug] : undefined;
        return { ...item, url, ...(lastmod && { lastmod }) };
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
