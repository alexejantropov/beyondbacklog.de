// Writes the e-mail templates as standalone HTML into emails/ for importing into Resend
// (Broadcasts → New → paste HTML, or Templates). Placeholders: {{{RESEND_UNSUBSCRIBE_URL}}}
// (Resend fills it), {{{CONFIRM_URL}}} (our API fills it when it sends the mail itself).
//   node scripts/export-email-templates.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { confirmationMail, issueMail, welcomeMail } from '../src/email/templates.ts';

mkdirSync('emails', { recursive: true });
writeFileSync('emails/bestaetigung.html', confirmationMail('{{{CONFIRM_URL}}}').html);
writeFileSync('emails/willkommen.html', welcomeMail().html);
writeFileSync('emails/ausgabe.html', issueMail({
  title: '{{{TITEL}}}',
  subtitle: '{{{UNTERTITEL}}}',
  date: '{{{DATUM}}}',
  url: '{{{URL}}}',
  coverUrl: undefined,
  intro: '{{{HINWEIS}}}',
  bodyHtml: '<p>{{{INHALT}}}</p>',
}));
writeFileSync('emails/README.md', `# E-Mail-Vorlagen für Resend

Erzeugt mit \`node scripts/export-email-templates.mjs\` aus \`src/email/templates.ts\` (eine Quelle für Website-Versand und Resend-Import).

| Datei | Zweck | Platzhalter |
|---|---|---|
| bestaetigung.html | Double-Opt-In-Bestätigung (schickt die Website selbst über die Resend-API) | {{{CONFIRM_URL}}} |
| willkommen.html | Willkommensmail nach der Bestätigung (schickt die Website selbst) | {{{RESEND_UNSUBSCRIBE_URL}}} |
| ausgabe.html | Rahmen einer Newsletter-Ausgabe. \`npm run newsletter -- <slug>\` füllt ihn aus einem Post; zum manuellen Import in Resend die Platzhalter ersetzen | {{{TITEL}}} {{{UNTERTITEL}}} {{{DATUM}}} {{{URL}}} {{{HINWEIS}}} {{{INHALT}}} {{{RESEND_UNSUBSCRIBE_URL}}} |

In Resend: Broadcasts → Create → Editor auf HTML umstellen → Datei-Inhalt einfügen. \`{{{RESEND_UNSUBSCRIBE_URL}}}\` muss im HTML bleiben, Resend setzt dort den Abmeldelink ein.
`);
console.log('emails/ geschrieben');
