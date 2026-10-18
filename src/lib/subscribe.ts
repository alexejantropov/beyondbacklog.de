// Double opt-in without a database: the confirmation link carries the e-mail address, a timestamp
// and an HMAC-SHA256 signature. Pure functions (unit tested); the API routes in src/pages/api use them.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { normalizeEmail } from './email.ts';

export { isValidEmail, normalizeEmail } from './email.ts';

export const TOKEN_MAX_AGE_MS = 48 * 60 * 60 * 1000;

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const fromB64url = (s: string) => Buffer.from(s, 'base64url').toString('utf8');

const sign = (secret: string, payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');

export function createToken(secret: string, email: string, now = Date.now()): string {
  const payload = `${normalizeEmail(email)}|${now}`;
  return `${b64url(payload)}.${sign(secret, payload)}`;
}

export type TokenResult = { ok: true; email: string } | { ok: false; reason: 'malformed' | 'signature' | 'expired' };

export function verifyToken(secret: string, token: string, now = Date.now(), maxAge = TOKEN_MAX_AGE_MS): TokenResult {
  const [payloadPart, signature] = token.split('.');
  if (!payloadPart || !signature) return { ok: false, reason: 'malformed' };
  let payload: string;
  try {
    payload = fromB64url(payloadPart);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  const expected = sign(secret, payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'signature' };
  const [email, ts] = payload.split('|');
  const issued = Number(ts);
  if (!email || !Number.isFinite(issued)) return { ok: false, reason: 'malformed' };
  if (now - issued > maxAge || issued > now + 60_000) return { ok: false, reason: 'expired' };
  return { ok: true, email };
}

/**
 * Simple in-memory rate limit per key (IP): at most `limit` hits per `windowMs`. Keys whose hits
 * have all expired are dropped once per window, so the map stays bounded by recent traffic.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;
  return (key: string, now = Date.now()): boolean => {
    if (now - lastSweep >= windowMs) {
      for (const [k, times] of hits) if (now - times[times.length - 1] >= windowMs) hits.delete(k);
      lastSweep = now;
    }
    const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
    const allowed = recent.length < limit;
    if (allowed) recent.push(now);
    hits.set(key, recent);
    return allowed;
  };
}

/**
 * Key for the rate limit: the client address as the trusted proxy saw it. `hops` = number of
 * proxies in front of the server that append to X-Forwarded-For (Replit: 1, env TRUSTED_PROXY_HOPS).
 * The entry `hops` from the end is the one the first trusted proxy added; everything before it is
 * client-controlled.
 */
export function clientKey(forwardedFor: string | null, fallback: string | undefined, hops = 1): string {
  const entries = (forwardedFor ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const fromHeader = entries.length >= hops && hops > 0 ? entries[entries.length - hops] : undefined;
  return fromHeader || fallback || 'unknown';
}
