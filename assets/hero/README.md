# Hero Image

`skcc-hero.jpg` — the full-bleed background on the home page
(`background-position: 62% 12%`, under a flat `rgba(8,8,8,0.6)` scrim).

Replace it with a 2400-2560px wide JPEG at q70-78, 250-500 KB. Keep the
filename; `index.html` preloads it by name. If the new frame crops badly,
adjust `background-position` on `.home-hero .hero-bg` in `assets/css/site.css`.

`hero.jpg` is left over from the previous version of the site and is unused.
