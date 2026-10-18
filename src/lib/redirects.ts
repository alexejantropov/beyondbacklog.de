// Redirect rules (src/data/redirects.ts): resolution and consistency checks. Pure functions,
// used by src/middleware.ts at runtime and by scripts/check-dist.mjs after the build.

export interface Redirect {
  from: string;
  to: string;
  /** Permanent by default. */
  status?: 301 | 302;
}

const pathOf = (url: string) => url.split(/[?#]/)[0] || '/';
const isSplat = (from: string) => from.endsWith('/*');

/** First matching rule for a path (exact, or splat prefix), with :splat filled in. */
export function resolveRedirect(path: string, list: Redirect[]): { rule: Redirect; target: string } | undefined {
  for (const rule of list) {
    if (rule.from === path) return { rule, target: rule.to };
    if (isSplat(rule.from)) {
      const prefix = rule.from.slice(0, -1);
      if (path.startsWith(prefix) && path.length > prefix.length) return { rule, target: rule.to.replace(':splat', path.slice(prefix.length)) };
    }
  }
  return undefined;
}

/** Canonical form of a request path: no trailing slash (except /), no duplicate slashes. */
export function normalizePath(path: string): string {
  const collapsed = path.replace(/\/{2,}/g, '/');
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
}

/** Substack sub-pages of a post (/p/<slug>/comments, /p/<slug>/comment/123) → the post. */
export function collapsePostPath(path: string): string {
  const m = path.match(/^\/p\/([^/]+)\/.+$/);
  return m ? `/p/${m[1]}` : path;
}

/** Problems: missing targets, sources that are pages, chains, duplicates. */
export function checkRedirects(list: Redirect[], routes: Set<string>): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const rule of list) {
    if (seen.has(rule.from)) errors.push(`${rule.from}: defined twice`);
    seen.add(rule.from);
    if (!isSplat(rule.from) && routes.has(rule.from)) errors.push(`${rule.from}: is a page, the redirect would never apply`);
    if (rule.to.includes(':splat')) continue;
    const target = pathOf(rule.to);
    if (!routes.has(target)) errors.push(`${rule.from} → ${rule.to}: target is not a page`);
    if (resolveRedirect(target, list)) errors.push(`${rule.from} → ${rule.to}: chain via a second redirect`);
  }
  return errors;
}

/** How a path resolves: a page, or exactly one permanent redirect to a page. Undefined = 404. */
export function resolvePath(path: string, list: Redirect[], routes: Set<string>): { status: 200 | 301; target: string } | undefined {
  const normalized = collapsePostPath(normalizePath(path));
  if (routes.has(normalized)) return normalized === path ? { status: 200, target: path } : { status: 301, target: normalized };
  const hit = resolveRedirect(normalized, list);
  if (!hit || (hit.rule.status ?? 301) !== 301) return undefined;
  return routes.has(pathOf(hit.target)) ? { status: 301, target: hit.target } : undefined;
}
