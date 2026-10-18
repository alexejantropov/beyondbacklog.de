# E-Mail-Vorlagen für Resend

Erzeugt mit `node scripts/export-email-templates.mjs` aus `src/email/templates.ts` (eine Quelle für Website-Versand und Resend-Import).

| Datei | Zweck | Platzhalter |
|---|---|---|
| bestaetigung.html | Double-Opt-In-Bestätigung (schickt die Website selbst über die Resend-API) | {{{CONFIRM_URL}}} |
| willkommen.html | Willkommensmail nach der Bestätigung (schickt die Website selbst) | {{{RESEND_UNSUBSCRIBE_URL}}} |
| ausgabe.html | Rahmen einer Newsletter-Ausgabe. `npm run newsletter -- <slug>` füllt ihn aus einem Post; zum manuellen Import in Resend die Platzhalter ersetzen | {{{TITEL}}} {{{UNTERTITEL}}} {{{DATUM}}} {{{URL}}} {{{HINWEIS}}} {{{INHALT}}} {{{RESEND_UNSUBSCRIBE_URL}}} |

In Resend: Broadcasts → Create → Editor auf HTML umstellen → Datei-Inhalt einfügen. `{{{RESEND_UNSUBSCRIBE_URL}}}` muss im HTML bleiben, Resend setzt dort den Abmeldelink ein.
