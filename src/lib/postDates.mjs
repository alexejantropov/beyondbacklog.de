// Publication dates of all posts from the Markdown frontmatter, for the sitemap's <lastmod>
// (astro.config.mjs runs before astro:content exists).
import { readdirSync, readFileSync } from 'node:fs';

/** @returns {Record<string, string>} slug → ISO date */
export function postDates(dir = 'src/content/posts') {
  /** @type {Record<string, string>} */
  const dates = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const m = readFileSync(`${dir}/${file}`, 'utf8').match(/^date:\s*(\S+)/m);
    if (m) dates[file.replace(/\.md$/, '')] = new Date(m[1]).toISOString();
  }
  return dates;
}
