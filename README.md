# SK Cannabis Connect

Marketing site for **SK Cannabis Connect**, the annual Saskatchewan cannabis trade
show run by [Open Fields Distribution](https://openfields.ca). Deployed to
GitHub Pages at [skcannaconnect.ca](https://skcannaconnect.ca) on every push to
`main` (`.github/workflows/deploy.yml`).

Plain static HTML/CSS/JS — no build step. Edit a file, push, done.

## Pages

| File | Screen | Job |
|---|---|---|
| `index.html` | Home | Announce that 2027 is coming; capture emails. |
| `past-events.html` | Past events | The 2026 recap — photography, producers, testimonials. |
| `exhibitors.html` | Exhibitors | Invite licensed producers to raise their hand for a 2027 booth. |

All three share the header, footer and verification gate, kept byte-identical
across the files. If you change one, change all three.

## Where the email signups go

The footer form (`Get the 2027 date before it goes public`) posts wherever you
point it. **Open `assets/js/site.js` and edit the `NEWSLETTER` block at the
top** — it is the first thing in the file, and nothing else needs to change.

```js
var NEWSLETTER = {
  mode: 'mailto',   // 'sheet' | 'post' | 'redirect' | 'mailto'
  ...
};
```

| `mode` | What happens | Set |
|---|---|---|
| `'sheet'` | Appends a row to a Google Sheet in your Drive. Free, no third-party account. **See below.** | `sheetUrl`, `sheetToken` |
| `'post'` | POSTs `{ email, source, page }` as JSON to a form or list provider — Formspree, Buttondown, a Netlify function, a Cloudflare Worker. The provider must send permissive CORS headers. | `endpoint` |
| `'redirect'` | Sends the visitor to a hosted form you already run (Typeform, Google Form, Mailchimp), carrying the address across in a query parameter. | `redirectUrl`, `emailParam` |
| `'mailto'` | Opens the visitor's mail app addressed to you. No setup, but it loses anyone without a mail client configured. **This is what ships today.** | `mailto` |

A hidden honeypot field sits in the form; anything that fills it is silently
dropped without a request going out. Bots see the same confirmation everyone
else does, so they get no signal they were caught.

Whatever you pick, the list is industry contact data: say what you will send
(the footer already promises "date, venue, and exhibitor applications, no other
mail") and keep an unsubscribe path in every send.

### Google Sheet setup

`tools/google-sheet-endpoint.gs` is an Apps Script web app that appends one row
per signup — timestamp, email, source, page — and skips addresses already in
the sheet. The full setup steps are in the comment at the top of that file; the
short version:

1. Make a Sheet, name the first tab `Signups`.
2. Extensions → Apps Script, paste the file in, change `SECRET`.
3. Deploy → New deployment → Web app, **Execute as: Me**, **Who has access:
   Anyone**. Copy the `/exec` URL.
4. In `assets/js/site.js` set `mode: 'sheet'`, `sheetUrl` to that URL, and
   `sheetToken` to the same string as `SECRET`. Push.

Pick `setup` in the editor's function dropdown and Run it once before
deploying — it writes the header row and logs which sheet it reached, so a
mis-wired script shows up now rather than as signups that silently vanish.

Four things that trip people up:

- **Access must be "Anyone", not "Anyone with a Google account."** The second
  one makes every signup fail, because visitors are not signed in to Google.
  On a Workspace account an admin policy can remove the "Anyone" option
  entirely; if it is not in the dropdown, the endpoint cannot be public.
- **Open the editor from inside the Sheet** (Extensions → Apps Script), which
  binds the script to it. A standalone project from script.google.com has no
  sheet attached — set `SHEET_ID` in the script if you went that route.
- **Editing the script does not update the live endpoint.** Deploy → Manage
  deployments → edit → Version: New version → Deploy. Keep the same deployment
  and the `/exec` URL stays the same, so the site needs no change.
- **Whoever deploys it owns it.** The endpoint runs as that account. If it is a
  work account that later gets deleted, signups stop with no warning — so put
  the Sheet in a Shared Drive and note who holds the deployment.

`sheetToken` is not a password — it ships in the site's JavaScript where anyone
can read it. It only stops drive-by bots that find the `/exec` URL from filling
your sheet with junk.

A Sheet captures the list; it does not send mail. When the 2027 date is ready
you will still need something to send from — Mailchimp and Buttondown both
import a CSV.

## Verification gate

`assets/js/site.js` → `initGate()`. Both boxes — 19+ and CannaSell certified —
must be ticked before `Enter site` unlocks. Confirmation is held in
`sessionStorage` under `skcc-verified`, so every new browser session
re-verifies. Switch `sessionStorage` to `localStorage` in the `stored`/`store`
helpers if you would rather remember it across visits.

## Testimonials

`past-events.html` → the `data-testimonials` attribute on `<section class="testimonials">`,
a JSON array of `{ quote, name, role, company }`. With one entry the rotator
stays a static quote and the controls are hidden; add a second and the dots,
arrows and 8-second auto-rotation switch themselves on.

## Producer wall

`past-events.html` → `<div class="producer-wall">`, one cell per producer.
Three filenames do not match their display name after historic renames —
trust the `alt`/`title`, not the file:

| File | Displays as |
|---|---|
| `tilray.png` | Portal |
| `olli.png` | OBi |
| `hybrid-infusions.png` | Virtue Cannabis |
| `canadas-island-garden.png` | FIGR — Fresh Island Grown |
| `5-points.png` | Er What? |

## Assets

```
assets/
  css/site.css      tokens, shared components, page sections
  css/fonts.css     @font-face for the self-hosted families
  fonts/            Hanken Grotesk 300/400/500/600, Newsreader 300 italic (woff2, latin + latin-ext)
  js/site.js        gate, header, newsletter, testimonials
  of/               Open Fields logo — forest and reversed ivory
  hero/             home hero photograph
  photos/           hero and gallery photography
  lp-logos/         producer marks, used as past-exhibitor credits
  favicon.svg
```

`tools/google-sheet-endpoint.gs` is not part of the site — it is the Apps
Script to paste into a Google Sheet if you use `'sheet'` mode.

Photography is re-exported for the web (heroes 2400px wide, gallery frames
1200–1400px). The camera originals live with Open Fields, not in this repo.

Type is **Hanken Grotesk** with **Newsreader** italic for the pull-quote, both
self-hosted under the Open Font License. They stand in for the brand faces,
Stevie Sans and Freight Display Pro; swap the families in `assets/css/fonts.css`
and the `--sans` / `--serif` tokens if the Adobe licences are in place.
