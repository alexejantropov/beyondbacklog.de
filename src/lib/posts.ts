import { getCollection, type CollectionEntry } from 'astro:content';
import { countWords, readingTime } from './seo';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first (no drafts, no pages). */
export async function publishedPosts(): Promise<Post[]> {
  const all = await getCollection('posts', p => !p.data.draft && !p.data.page);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Posts listed on /beitraege and the homepage: everything except the KI-Radar series. */
export async function listedPosts(): Promise<Post[]> {
  return (await publishedPosts()).filter(p => !p.data.kiRadar);
}

/** The KI-Radar series, newest first (/ki-radar). */
export async function kiRadarPosts(): Promise<Post[]> {
  return (await publishedPosts()).filter(p => p.data.kiRadar);
}

/** Pages like /p/work-with-me, routed like posts but not listed. */
export async function publishedPages(): Promise<Post[]> {
  return getCollection('posts', p => !p.data.draft && p.data.page);
}

export const postPath = (post: Post) => `/p/${post.id}`;

export const minutes = (post: Post) => readingTime(countWords(post.body ?? ''));

/** Up to `n` other posts: same language first, then newest. */
export function relatedPosts(post: Post, all: Post[], n = 3): Post[] {
  const others = all.filter(p => p.id !== post.id);
  const sameLang = (p: Post) => Number(p.data.lang === post.data.lang);
  return others.sort((a, b) => sameLang(b) - sameLang(a) || b.data.date.getTime() - a.data.date.getTime()).slice(0, n);
}
