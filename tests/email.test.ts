import { describe, expect, it } from 'vitest';
import { confirmationMail, issueMail, styleIssueBody, welcomeMail } from '../src/email/templates';
import { readEnv } from '../src/lib/resend';

describe('e-mail templates', () => {
  it('puts the confirmation link into the button and the text part', () => {
    const url = 'https://www.beyondbacklog.de/api/confirm?t=abc.def';
    const mail = confirmationMail(url);
    expect(mail.html).toContain(`href="${url}"`);
    expect(mail.text).toContain(url);
    expect(mail.subject).toMatch(/bestätige/);
    // Two steps since the confirmation page (mail scanners must not subscribe anyone).
    expect(mail.html).not.toMatch(/Ein Klick/);
  });
  it('styles headings and quotes that carry attributes', () => {
    const html = styleIssueBody('<h2 id="x">T</h2><h3>U</h3><blockquote>\n<p>Q</p></blockquote>');
    expect(html).toMatch(/<h2 style="[^"]+" id="x">/);
    expect(html).toMatch(/<h3 style="[^"]+">/);
    expect(html).toMatch(/<blockquote style="[^"]+">/);
  });
  it('gives broadcasts the Resend unsubscribe link, but not the transactional welcome mail', () => {
    // Resend fills {{{RESEND_UNSUBSCRIBE_URL}}} only in broadcasts; in a transactional mail it would stay literal.
    expect(welcomeMail().html).not.toContain('{{{RESEND_UNSUBSCRIBE_URL}}}');
    expect(welcomeMail().html).toMatch(/Abmelden/);
    expect(issueMail({ title: 't', date: 'd', url: 'https://x', bodyHtml: '' })).toContain('{{{RESEND_UNSUBSCRIBE_URL}}}');
  });
  it('falls back to the title as preheader when the subtitle is empty', () => {
    expect(issueMail({ title: 'Titel', subtitle: '', date: 'd', url: 'https://x', bodyHtml: '' })).toMatch(/opacity:0[^>]*>Titel</);
  });
  it('escapes title and subtitle of an issue but keeps the post HTML', () => {
    const html = issueMail({ title: 'A <b> & C', subtitle: 'Sub "x"', date: '1. Januar 2026', url: 'https://x', bodyHtml: '<p>Text</p>' });
    expect(html).toContain('A &lt;b&gt; &amp; C');
    expect(html).toContain('Sub &quot;x&quot;');
    expect(html).toContain('<p>Text</p>');
    expect(html).not.toContain('<b>');
  });
});

describe('mail environment', () => {
  it('requires the API key and the signing secret', () => {
    expect(() => readEnv({})).toThrow(/RESEND_API_KEY/);
    expect(() => readEnv({ RESEND_API_KEY: 'k' })).toThrow(/SUBSCRIBE_SECRET/);
  });
  it('fills defaults and strips the trailing slash of the site URL', () => {
    const env = readEnv({ RESEND_API_KEY: 'k', SUBSCRIBE_SECRET: 's', SITE_URL: 'http://localhost:4321/', RESEND_TOPIC_ID: '' });
    expect(env.siteUrl).toBe('http://localhost:4321');
    expect(env.topicId).toBeUndefined();
    expect(env.segmentId).toBe('');
    expect(env.from).toMatch(/@beyondbacklog\.de>$/);
  });
});
