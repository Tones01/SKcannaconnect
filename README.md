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
  mode: 'mailto',   // 'mailto' | 'post' | 'redirect'
  ...
};
```

| `mode` | What happens | Set |
|---|---|---|
| `'mailto'` | Opens the visitor's mail app addressed to you. No service, no setup — but it loses anyone without a mail client configured. **This is what ships today.** | `mailto` |
| `'post'` | POSTs `{ email, source }` as JSON to an endpoint and shows the confirmation on success. **Use this one.** | `endpoint` |
| `'redirect'` | Sends the visitor to a hosted form you already run, carrying the address across in a query parameter. | `redirectUrl`, `emailParam` |

Any endpoint that accepts a JSON `POST` and returns permissive CORS headers works
with `'post'` — Formspree, Buttondown, a Netlify function, a Cloudflare Worker,
or your own API.

Whatever you pick, the list is industry contact data: say what you will send
(the footer already promises "date, venue, and exhibitor applications, no other
mail") and keep an unsubscribe path in every send.

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

Photography is re-exported for the web (heroes 2400px wide, gallery frames
1200–1400px). The camera originals live with Open Fields, not in this repo.

Type is **Hanken Grotesk** with **Newsreader** italic for the pull-quote, both
self-hosted under the Open Font License. They stand in for the brand faces,
Stevie Sans and Freight Display Pro; swap the families in `assets/css/fonts.css`
and the `--sans` / `--serif` tokens if the Adobe licences are in place.
