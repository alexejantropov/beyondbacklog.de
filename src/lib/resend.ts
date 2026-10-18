// Resend client and the few calls the site makes (confirmation mail, contact creation).
// Secrets come from the environment (Replit: Deployment → Secrets; local: .env).
import { Resend } from 'resend';
import { mailFrom, site } from '../data/site';

export interface MailEnv {
  apiKey: string;
  from: string;
  segmentId: string;
  topicId?: string;
  siteUrl: string;
  secret: string;
}

export function readEnv(env: Record<string, string | undefined> = process.env): MailEnv {
  const apiKey = env.RESEND_API_KEY;
  const secret = env.SUBSCRIBE_SECRET;
  if (!apiKey || !secret) throw new Error('RESEND_API_KEY and SUBSCRIBE_SECRET must be set');
  return {
    apiKey,
    secret,
    from: env.MAIL_FROM || mailFrom,
    segmentId: env.RESEND_SEGMENT_ID || '',
    topicId: env.RESEND_TOPIC_ID || undefined,
    siteUrl: (env.SITE_URL || site.url).replace(/\/$/, ''),
  };
}

export const client = (env: MailEnv) => new Resend(env.apiKey);

export async function sendMail(env: MailEnv, to: string, mail: { subject: string; html: string; text: string }, replyTo?: string) {
  const { error } = await client(env).emails.send({ from: env.from, to, subject: mail.subject, html: mail.html, text: mail.text, replyTo });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Creates the contact in the newsletter segment, or re-subscribes an existing one (Resend keeps
 * one contact per address: then the contact is updated, added to the segment and opted in to the
 * topic). Returns whether the address was already an active subscriber (then no welcome mail).
 */
export async function subscribeContact(env: MailEnv, email: string, source = 'website'): Promise<{ alreadySubscribed: boolean }> {
  const resend = client(env);
  const properties = { source, confirmed_at: new Date().toISOString() };
  const created = await resend.contacts.create({
    email,
    unsubscribed: false,
    properties,
    ...(env.segmentId && { segments: [{ id: env.segmentId }] }),
    ...(env.topicId && { topics: [{ id: env.topicId, subscription: 'opt_in' as const }] }),
  });
  if (!created.error) return { alreadySubscribed: false };
  if (!/exist|already|duplicate|conflict/i.test(created.error.message)) throw new Error(`Resend: ${created.error.message}`);

  const existing = await resend.contacts.get({ email });
  const alreadySubscribed = Boolean(existing.data && !existing.data.unsubscribed);
  const updated = await resend.contacts.update({ email, unsubscribed: false, properties });
  if (updated.error) throw new Error(`Resend: ${updated.error.message}`);
  if (env.segmentId) {
    const added = await resend.contacts.segments.add({ email, segmentId: env.segmentId });
    if (added.error && !/already/i.test(added.error.message)) throw new Error(`Resend: ${added.error.message}`);
  }
  if (env.topicId) {
    const topics = await resend.contacts.topics.update({ email, topics: [{ id: env.topicId, subscription: 'opt_in' }] });
    if (topics.error) throw new Error(`Resend: ${topics.error.message}`);
  }
  return { alreadySubscribed };
}
