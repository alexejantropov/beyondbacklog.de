// POST /api/subscribe: validates the address, sends the confirmation mail (double opt-in).
// Accepts JSON (fetch from the form script) or a form POST (no JS) and answers accordingly.
export const prerender = false;
import type { APIRoute } from 'astro';
import { confirmationMail } from '../../email/templates';
import { readEnv, sendMail } from '../../lib/resend';
import { SUBSCRIBE_MESSAGES as MSG } from '../../lib/email';
import { clientKey, createRateLimiter, createToken, isValidEmail, normalizeEmail } from '../../lib/subscribe';

// Per client (5 per 10 min) and overall (60 per 10 min) as a backstop against address spoofing.
const allowClient = createRateLimiter(5, 10 * 60 * 1000);
const allowGlobal = createRateLimiter(60, 10 * 60 * 1000);

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const isJson = request.headers.get('content-type')?.includes('application/json');
  const wantsJson = isJson || request.headers.get('accept')?.includes('application/json');
  // Without JS the form page shows the message for the anchor (CSS :target, src/pages/newsletter.astro).
  const respond = (ok: boolean, message: string, status = ok ? 200 : 400, anchor = 'fehler') =>
    wantsJson ? new Response(JSON.stringify({ ok, message }), { status, headers: { 'content-type': 'application/json; charset=utf-8' } }) : redirect(ok ? '/newsletter-danke' : `/newsletter#${anchor}`, 303);

  let email: string;
  let honeypot: string;
  try {
    if (isJson) {
      const body = await request.json();
      email = String(body.email ?? '');
      honeypot = String(body.website ?? '');
    } else {
      const form = await request.formData();
      email = String(form.get('email') ?? '');
      honeypot = String(form.get('website') ?? '');
    }
  } catch {
    return respond(false, 'Ungültige Anfrage.');
  }

  // Bots fill the hidden field: pretend success, send nothing.
  if (honeypot) return respond(true, MSG.sent);

  email = normalizeEmail(email);
  if (!isValidEmail(email)) return respond(false, MSG.invalid, 400, 'ungueltig');

  const ip = clientKey(request.headers.get('x-forwarded-for'), clientAddress, Number(process.env.TRUSTED_PROXY_HOPS ?? 1));
  if (!allowClient(ip) || !allowGlobal('all')) return respond(false, 'Zu viele Versuche. Bitte probier es in ein paar Minuten noch einmal.', 429, 'zu-viele');

  try {
    const env = readEnv();
    const token = createToken(env.secret, email);
    const confirmUrl = `${env.siteUrl}/api/confirm?t=${encodeURIComponent(token)}`;
    await sendMail(env, email, confirmationMail(confirmUrl));
  } catch (error) {
    console.error('subscribe failed', error);
    return respond(false, MSG.failed, 500);
  }
  return respond(true, MSG.sent);
};

export const GET: APIRoute = ({ redirect }) => redirect('/newsletter', 302);
