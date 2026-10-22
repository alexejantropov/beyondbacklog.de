import { describe, expect, it } from 'vitest';
import { redirects } from '../src/data/redirects';
import { checkRedirects, collapsePostPath, normalizePath, resolvePath, resolveRedirect } from '../src/lib/redirects';

const routes = new Set(['/', '/beitraege', '/newsletter', '/feed.xml', '/p/foo', '/sitemap-index.xml', '/about']);

describe('redirects', () => {
  it('resolves exact and splat rules', () => {
    expect(resolveRedirect('/feed', redirects)?.target).toBe('/feed.xml');
    expect(resolveRedirect('/account/settings', redirects)?.target).toBe('/');
    expect(resolveRedirect('/p/foo', redirects)).toBeUndefined();
  });
  it('normalizes trailing and duplicate slashes', () => {
    expect(normalizePath('/p/foo/')).toBe('/p/foo');
    expect(normalizePath('//p//foo')).toBe('/p/foo');
    expect(normalizePath('/')).toBe('/');
  });
  it('collapses Substack sub-pages of a post', () => {
    expect(collapsePostPath('/p/foo/comments')).toBe('/p/foo');
    expect(collapsePostPath('/p/foo/comment/123')).toBe('/p/foo');
    expect(collapsePostPath('/p/foo')).toBe('/p/foo');
    expect(collapsePostPath('/about/')).toBe('/about/');
  });
  it('finds missing targets, shadowed pages, chains and duplicates', () => {
    const errors = checkRedirects([{ from: '/a', to: '/missing' }, { from: '/about', to: '/' }, { from: '/old', to: '/feed' }, { from: '/x', to: '/' }, { from: '/x', to: '/about' }], routes);
    expect(errors.join('\n')).toMatch(/\/a → \/missing: target is not a page/);
    expect(errors.join('\n')).toMatch(/\/about: is a page/);
    expect(errors.join('\n')).toMatch(/\/old → \/feed: target is not a page/);
    expect(errors.join('\n')).toMatch(/\/x: defined twice/);
  });
  it('resolves a path to a page, one redirect, or nothing', () => {
    expect(resolvePath('/p/foo', redirects, routes)).toEqual({ status: 200, target: '/p/foo' });
    expect(resolvePath('/p/foo/', redirects, routes)).toEqual({ status: 301, target: '/p/foo' });
    expect(resolvePath('/p/foo/comments', redirects, routes)).toEqual({ status: 301, target: '/p/foo' });
    expect(resolvePath('/subscribe', redirects, routes)).toEqual({ status: 301, target: '/newsletter' });
    // Former topic/tag pages and the English-only how-to: all posts are on /beitraege now.
    for (const old of ['/p/how-to-get-english-only-posts', '/p/how-to-get-english-only-posts/comments', '/s/english-only', '/s/ki', '/t/ki']) {
      expect(resolvePath(old, redirects, routes), old).toEqual({ status: 301, target: '/beitraege' });
    }
    expect(resolvePath('/nope', redirects, routes)).toBeUndefined();
  });
  it('keeps the production rules consistent against the real routes', () => {
    expect(checkRedirects(redirects, routes)).toEqual([]);
  });
});
