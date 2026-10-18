# LinkedIn-Feed auf der Startseite

Die drei neuesten Einträge aus `posts.json` erscheinen auf der Startseite unter „Aktuell auf LinkedIn“ (Komponente `src/components/LinkedInFeed.astro`). LinkedIn hat keine öffentliche API für persönliche Posts, deshalb werden sie hier von Hand gepflegt.

Neuer Post:

1. Eintrag oben in `posts.json` anlegen: `id` (eindeutig, z. B. Datum plus Stichwort), `date` (YYYY-MM-DD), `text` (Absätze mit `\n\n`), `url` (Link zum Post auf LinkedIn: Post öffnen → „…“ → „Link zum Beitrag kopieren“).
2. Optional ein Bild nach `src/assets/linkedin/` legen und als `"image": "~/assets/linkedin/<datei>"` mit `imageAlt` eintragen (Querformat 16:9 passt am besten).
3. `npm run ci`, commit, push, Replit neu veröffentlichen.

`"draft": true` blendet einen Eintrag aus, ohne ihn zu löschen. Die `url` der drei Einträge zeigt noch auf die Aktivitäten-Übersicht; sobald der jeweilige Post-Link vorliegt, dort eintragen.
