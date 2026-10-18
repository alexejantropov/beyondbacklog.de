// Double-opt-in confirmation. GET /api/confirm?t=… only shows the confirmation page (mail scanners
// such as Outlook Safe Links open links in advance); the subscription happens on POST from the
// button on that page. Token: signed, 48 h (src/lib/subscribe.ts). Known limit without a database:
// a token stays valid for 48 h even after an unsubscribe in between.
export const prerender = false;
import type { APIRoute } from 'astro';
import { welcomeMail } from '../../email/templates';
import { readEnv, sendMail, subscribeContact } from '../../lib/resend';
import { clientKey, createRateLimiter, verifyToken } from '../../lib/subscribe';

const allowClient = createRateLimiter(10, 10 * 60 * 1000);

export const GET: APIRoute = ({ url, redirect }) => {
  const token = url.searchParams.get('t') ?? '';
  return redirect(`/newsletter-bestaetigen?t=${encodeURIComponent(token)}`, 303);
};

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const ip = clientKey(request.headers.get('x-forwarded-for'), clientAddress, Number(process.env.TRUSTED_PROXY_HOPS ?? 1));
  if (!allowClient(ip)) return redirect('/newsletter-fehler#technik', 303);
  let token: string;
  try {
    const form = await request.formData();
    token = String(form.get('t') ?? '');
  } catch {
    return redirect('/newsletter-fehler', 303);
  }
  let env;
  try {
    env = readEnv();
  } catch (error) {
    console.error(error);
    return redirect('/newsletter-fehler#technik', 303);
  }
  const result = verifyToken(env.secret, token);
  if (!result.ok) return redirect('/newsletter-fehler', 303);
  try {
    const { alreadySubscribed } = await subscribeContact(env, result.email);
    // A second click on the button or a reopened page must not send the welcome mail again.
    if (!alreadySubscribed) {
      try {
        await sendMail(env, result.email, welcomeMail());
      } catch (error) {
        console.error('welcome mail failed', error);
      }
    }
  } catch (error) {
    // Resend outage or API error: the link itself is fine, say so.
    console.error('confirm failed', error);
    return redirect('/newsletter-fehler#technik', 303);
  }
  return redirect('/newsletter-bestaetigt', 303);
};
