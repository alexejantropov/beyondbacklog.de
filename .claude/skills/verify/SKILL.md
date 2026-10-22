---
name: verify
description: Run beyondbacklog.de like production and observe a change in the browser or the importer CLI.
---

# Verify beyondbacklog.de at runtime

## Website (like Replit serves it)
```bash
npm run build                                   # dist/ (prerendered pages + node adapter)
PORT=4398 HOST=127.0.0.1 node server.mjs &      # own port; the dev server uses 4321
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://127.0.0.1:4398/s/ki   # redirects
lsof -iTCP:4398 -sTCP:LISTEN -t | xargs kill    # stop it afterwards
```
- Drive pages with Playwright from a script in the scratchpad, `require('<repo>/node_modules/playwright')`.
- Which responsive image loaded: compare `new URL(img.currentSrc).pathname` with the `srcset` entries
  (`naturalWidth` is density-corrected and says nothing). Scroll lazy images into view first.
- Restart `server.mjs` after every rebuild: a running one serves stale on-demand chunks (500s).
- The empty `#lightbox-img` on prose pages is a placeholder, not a broken image.
- Screenshot the author portrait via its wrapper (`img.closest('.relative')`), not the `<img>`:
  the quote sticker sticks out over the left edge and is cut off in an element shot of the image.
- No `.env` locally: the sign-up form ends in the error message (no mail is sent). Safe to submit.

## Importer CLI
```bash
npm run import:substack -- <slug> [<slug>…]     # zsh: pass a list as an array, not "$VAR"
```
- Posts with `imported: false` are skipped. To probe one, copy the file aside, delete that line,
  import, compare, then restore the copy.
- Re-importing an unchanged post must leave the Markdown and `src/assets/posts/<slug>/` identical.

## Dev server (localhost:4321)
After a content schema change: `npx astro dev stop`, then `npm run dev`.
