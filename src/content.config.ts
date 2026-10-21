import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { tagSlugs } from './data/site';

// Posts: one Markdown file per post in src/content/posts/<slug>.md, written by
// scripts/import-substack.mjs from the Substack backup and edited by hand afterwards.
// The file name is the URL slug (/p/<slug>), identical to Substack.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Substack subtitle: used as teaser and meta description. */
      subtitle: z.string().default(''),
      /** Kicker on teaser cards, in place of the date. One or two words, three only with an article or preposition. */
      eyebrow: z.string().default(''),
      date: z.coerce.date(),
      lang: z.enum(['de', 'en']).default('de'),
      tags: z.array(z.enum(tagSlugs)).default([]),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      /** Substack post id, kept for traceability. */
      substackId: z.number().optional(),
      /** Substack "page" (e.g. /p/work-with-me): not a post, not in lists or the feed. */
      page: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

// LinkedIn posts for the homepage feed (design variant A, 17.10.2026). LinkedIn has no public API
// for personal posts, so they are maintained by hand in src/content/linkedin/posts.json: newest
// first is not required, the feed sorts by date and shows the three newest. Images go to
// src/assets/linkedin/ and are referenced as ~/assets/linkedin/<file>.
const linkedin = defineCollection({
  loader: file('./src/content/linkedin/posts.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      date: z.coerce.date(),
      /** Post text; blank lines separate paragraphs. */
      text: z.string(),
      /** Link to the post on LinkedIn (…/posts/… or …/feed/update/…). */
      url: z.url(),
      image: image().optional(),
      imageAlt: z.string().default(''),
      /** Hide a post without deleting it. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, linkedin };
