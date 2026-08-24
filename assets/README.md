# Assets

| Folder | What lives here |
|---|---|
| `css/` | `site.css` (tokens + components + page sections) and `fonts.css` (`@font-face`). |
| `fonts/` | Self-hosted woff2: Hanken Grotesk 300/400/500/600 and Newsreader 300 italic, latin + latin-ext subsets. |
| `js/` | `site.js` — verification gate, header behaviour, newsletter form, testimonial rotator. |
| `of/` | Open Fields Distribution logo. `logo-primary.svg` is Forest `#0D211B` for light surfaces; `logo-primary-ivory.svg` is the reversed Ivory `#F6F2E9` version for dark ones. Single colour only — never recoloured or rearranged. |
| `hero/` | `skcc-hero.jpg`, the home hero. |
| `photos/` | Event photography — see `photos/README.md`. |
| `lp-logos/` | Producer marks used as past-exhibitor credits — see `lp-logos/README.md`. |
| `favicon.svg` | The Open Fields `[ o ]` mark in Ochre on Forest. |

## Re-exporting photography

Camera originals are 5-13 MB. Before committing anything here:

| Use | Width | Quality | Target |
|---|---|---|---|
| Hero / full-bleed | 2400-2560px | JPEG q70-78 | 250-500 KB |
| Gallery frame (4:5) | 1200-1400px | JPEG q76 | 120-330 KB |
| Producer logo | 176px tall | PNG, optimised | under ~40 KB |

Everything below the fold carries `loading="lazy"`; the heroes carry
`fetchpriority="high"` and the home hero is preloaded.
