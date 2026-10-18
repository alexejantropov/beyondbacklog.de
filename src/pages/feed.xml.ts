import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { postPath, publishedPosts } from '../lib/posts';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await publishedPosts();
  return rss({
    title: site.name,
    description: site.tagline,
    site: context.site!,
    stylesheet: false,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.subtitle,
      pubDate: post.data.date,
      link: postPath(post),
      categories: post.data.tags,
      author: site.contactEmail,
    })),
    customData: `<language>de-DE</language>`,
  });
}
