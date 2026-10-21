// E-mail HTML for Resend: confirmation (double opt-in), welcome, and the newsletter issue layout
// (scripts/newsletter.mjs). Table-based, inline styles, same look as the site. The same templates
// are exported as files in emails/ (scripts/export-email-templates.mjs) for importing into Resend.
import { site } from '../data/site.ts';

const ACCENT = '#9747ff';
const ACCENT_DEEP = '#6d33b8';
const INK = '#0a0a0a';
const PAPER = '#fafaf7';
const MUTED = 'rgba(10,10,10,0.6)';
const FONT = "'Open Sans', Helvetica, Arial, sans-serif";
// Same steps as src/styles/global.css (--radius-card / --radius-box / --radius-control). Px: mail clients.
const RADIUS_CARD = '10px';
const RADIUS_BOX = '12px';
const RADIUS_CONTROL = '8px';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface ShellOptions {
  /** Preheader text (shown in inbox previews, hidden in the mail). */
  preheader?: string;
  /** Footer line with the unsubscribe link, e.g. for broadcasts. */
  footer?: string;
}

/** Common frame: header with wordmark, white card, footer. */
export function shell(body: string, { preheader = '', footer = '' }: ShellOptions = {}): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 0 20px">
  <a href="${site.url}" style="text-decoration:none;color:${INK};font-size:20px;font-weight:800;letter-spacing:-0.02em">${esc(site.name)}</a>
  <div style="height:3px;width:56px;background:${ACCENT};margin-top:10px;border-radius:2px"></div>
</td></tr>
<tr><td style="background:#ffffff;border:1px solid rgba(10,10,10,0.1);border-radius:${RADIUS_BOX};padding:32px 28px;font-size:17px;line-height:1.6">
${body}
</td></tr>
<tr><td style="padding:24px 8px 0;font-size:13px;line-height:1.6;color:${MUTED}">
  ${footer}
  <p style="margin:12px 0 0">${esc(site.author)} · ${esc(site.location)} · <a href="${site.url}/impressum" style="color:${MUTED}">Impressum</a> · <a href="${site.url}/datenschutz" style="color:${MUTED}">Datenschutz</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="border-radius:${RADIUS_CONTROL};background:${ACCENT}"><a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:700;text-decoration:none;border-radius:${RADIUS_CONTROL}">${esc(label)}</a></td></tr></table>`;

export const heading = (text: string) => `<h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;letter-spacing:-0.02em;font-weight:800">${text}</h1>`;
export const hand = (text: string) => `<p style="margin:0 0 8px;font-family:'Caveat',cursive;font-size:24px;line-height:1.1;color:${ACCENT_DEEP}">${esc(text)}</p>`;

/** Double-opt-in confirmation. */
export function confirmationMail(confirmUrl: string): { subject: string; html: string; text: string } {
  const subject = `Bitte bestätige deine Anmeldung bei ${site.name}`;
  const html = shell(
    `${hand('Fast geschafft')}
${heading('Bitte bestätige deine Anmeldung.')}
<p style="margin:0 0 8px">Du hast dich für den Newsletter von ${esc(site.name)} angemeldet. Klick auf den Button und bestätige auf der folgenden Seite, dann bist du dabei:</p>
${button(confirmUrl, 'Anmeldung bestätigen')}
<p style="margin:0;font-size:14px;color:${MUTED}">Der Link gilt 48 Stunden. Falls du dich nicht angemeldet hast, ignoriere diese Mail einfach, dann passiert nichts.</p>`,
    { preheader: 'Nur noch bestätigen, dann bist du dabei.' },
  );
  const text = `Fast geschafft: Bitte bestätige deine Anmeldung bei ${site.name}.\n\n${confirmUrl}\n\nDer Link gilt 48 Stunden. Falls du dich nicht angemeldet hast, ignoriere diese Mail.`;
  return { subject, html, text };
}

/** Welcome mail after confirmation. */
export function welcomeMail(): { subject: string; html: string; text: string } {
  const subject = `Willkommen bei ${site.name}`;
  const html = shell(
    `${hand('Willkommen')}
${heading('Du bist dabei.')}
<p style="margin:0 0 12px">Danke für deine Anmeldung. ${esc(site.tagline)} Erfahrungen und Learnings aus 20 Jahren agiler Produktentwicklung, unregelmäßig und ohne Hype.</p>
<p style="margin:0 0 12px">Damit nichts im Spam landet: Nimm <strong>${esc(site.contactEmail)}</strong> ins Adressbuch.</p>
${button(site.url, 'Alle Beiträge lesen')}
<p style="margin:0;font-size:14px;color:${MUTED}">Antworten auf diese Mail landen direkt bei mir.</p>`,
    { preheader: 'Danke für deine Anmeldung.', footer: `<p style="margin:0">Du bekommst diese Mail, weil du dich auf beyondbacklog.de angemeldet hast. Abmelden: über den Link am Ende jeder Ausgabe oder mit einer kurzen Antwort auf diese Mail.</p>` },
  );
  const text = `Willkommen bei ${site.name}. Danke für deine Anmeldung. Alle Beiträge: ${site.url}`;
  return { subject, html, text };
}

/** Inline styles for rendered post HTML inside an issue (mail clients ignore <style>). */
export const styleIssueBody = (html: string): string =>
  html
    .replace(/<img /g, `<img style="max-width:100%;height:auto;border-radius:${RADIUS_CARD}" `)
    .replace(/<blockquote(?=[\s>])/g, `<blockquote style="margin:20px 0;padding:4px 0 4px 18px;border-left:4px solid ${ACCENT};font-size:19px;line-height:1.45;color:${INK}"`)
    .replace(/<h2(?=[\s>])/g, '<h2 style="font-size:24px;line-height:1.2;margin:28px 0 10px"')
    .replace(/<h3(?=[\s>])/g, '<h3 style="font-size:20px;line-height:1.25;margin:24px 0 8px"')
    .replace(/<a /g, `<a style="color:${ACCENT_DEEP}" `);

export interface IssueInput {
  title: string;
  subtitle?: string;
  date: string;
  url: string;
  /** Rendered post HTML (absolute image URLs). */
  bodyHtml: string;
  coverUrl?: string;
  /** Short note at the top, e.g. the first issue after the move. */
  intro?: string;
}

/** Newsletter issue (broadcast). Uses Resend's unsubscribe placeholder. */
export function issueMail({ title, subtitle, date, url, bodyHtml, coverUrl, intro }: IssueInput): string {
  const body = `${hand(date)}
${heading(esc(title))}
${subtitle ? `<p style="margin:0 0 16px;font-size:19px;line-height:1.5;color:rgba(10,10,10,0.7)">${esc(subtitle)}</p>` : ''}
${intro ? `<p style="margin:0 0 20px;padding:14px 16px;background:#f0ebfa;border-radius:${RADIUS_CARD};font-size:15px">${intro}</p>` : ''}
${coverUrl ? `<a href="${url}"><img src="${coverUrl}" alt="" width="544" style="width:100%;height:auto;border-radius:${RADIUS_CARD};display:block;margin:0 0 20px"></a>` : ''}
<div class="post" style="font-size:17px;line-height:1.65">${bodyHtml}</div>
${button(url, 'Im Browser lesen')}`;
  return shell(body, {
    preheader: subtitle || title,
    footer: `<p style="margin:0">Du bekommst diese Mail, weil du ${esc(site.name)} abonniert hast. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${MUTED}">Abmelden</a> · <a href="${url}" style="color:${MUTED}">Im Browser lesen</a></p>`,
  });
}
