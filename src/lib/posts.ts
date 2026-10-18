import { getCollection, type CollectionEntry } from 'astro:content';
import type { TagSlug } from '../data/site';
import { countWords, readingTime } from './seo';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first (no drafts, no pages). */
export async function publishedPosts(): Promise<Post[]> {
  const all = await getCollection('posts', p => !p.data.draft && !p.data.page);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Pages like /p/work-with-me, routed like posts but not listed. */
export async function publishedPages(): Promise<Post[]> {
  return getCollection('posts', p => !p.data.draft && p.data.page);
}

export const postPath = (post: Post) => `/p/${post.id}`;

export const minutes = (post: Post) => readingTime(countWords(post.body ?? ''));

export const postsWithTag = (posts: Post[], tag: TagSlug) => posts.filter(p => p.data.tags.includes(tag));

/** Up to `n` other posts: same tags first, then newest. */
export function relatedPosts(post: Post, all: Post[], n = 3): Post[] {
  const others = all.filter(p => p.id !== post.id);
  const shared = (p: Post) => p.data.tags.filter(t => post.data.tags.includes(t)).length;
  return [...others].sort((a, b) => shared(b) - shared(a) || b.data.date.getTime() - a.data.date.getTime()).slice(0, n);
}
