import { describe, expect, it } from 'vitest';
import { createRateLimiter, createToken, isValidEmail, normalizeEmail, verifyToken } from '../src/lib/subscribe';

const secret = 'test-secret-with-enough-entropy';

describe('double opt-in tokens', () => {
  it('round-trips a normalized address', () => {
    const token = createToken(secret, ' Alexej@Example.COM ', 1000);
    expect(verifyToken(secret, token, 2000)).toEqual({ ok: true, email: 'alexej@example.com' });
  });
  it('rejects tampered, foreign and expired tokens', () => {
    const token = createToken(secret, 'a@b.de', 1000);
    expect(verifyToken(secret, token + 'x', 2000)).toMatchObject({ ok: false, reason: 'signature' });
    expect(verifyToken('other', token, 2000)).toMatchObject({ ok: false, reason: 'signature' });
    expect(verifyToken(secret, token, 1000 + 49 * 3600 * 1000)).toMatchObject({ ok: false, reason: 'expired' });
    expect(verifyToken(secret, 'garbage', 2000)).toMatchObject({ ok: false, reason: 'malformed' });
  });
  it('validates addresses conservatively', () => {
    expect(isValidEmail('a@b.de')).toBe(true);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('no spaces@b.de')).toBe(false);
    expect(normalizeEmail('  X@Y.DE ')).toBe('x@y.de');
  });
  it('rate limits per key', () => {
    const allow = createRateLimiter(2, 1000);
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 1)).toBe(true);
    expect(allow('ip', 2)).toBe(false);
    expect(allow('ip', 1500)).toBe(true);
    expect(allow('other', 2)).toBe(true);
  });
});

import { clientKey } from '../src/lib/subscribe';
it('takes the client address the trusted proxy saw, never the spoofable first entry', () => {
  expect(clientKey('1.1.1.1, 2.2.2.2, 9.9.9.9', 'fallback', 1)).toBe('9.9.9.9');
  expect(clientKey('1.1.1.1, 2.2.2.2, 9.9.9.9', 'fallback', 2)).toBe('2.2.2.2');
  expect(clientKey('', 'fallback', 1)).toBe('fallback');
  expect(clientKey(null, undefined, 1)).toBe('unknown');
});
