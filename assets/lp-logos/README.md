# Producer logos

The 22 producers who exhibited at SK Cannabis Connect 2026, shown as the logo
wall on `past-events.html` in this order. Third-party marks, used with
permission as past-exhibitor credits.

Several are dark-on-transparent, which is why the wall sits on the Ivory band.

| File | Displays as |
|---|---|
| `auxly.png` | Auxly |
| `canopy-growth.png` | Canopy Growth |
| `organigram.png` | Organigram Global |
| `tilray.png` | Portal |
| `sndl.png` | SNDL |
| `decibel.png` | Decibel |
| `pure-sunfarms.png` | Pure Sunfarms |
| `cannara.png` | Cannara |
| `cannapiece.png` | CannaPiece Corp |
| `rubicon.png` | Rubicon Organics |
| `heritage.png` | Heritage Cannabis |
| `canadas-island-garden.png` | FIGR — Fresh Island Grown |
| `olli.png` | OBi |
| `weed-me.png` | Weed Me |
| `space-race.png` | Space Race Cannabis |
| `sticky-greens.png` | Sticky Greens |
| `herba-farms.png` | Herba |
| `prairie-craft.png` | Prairie Craft Canopy |
| `hybrid-infusions.png` | Virtue Cannabis |
| `dom-jackson.png` | Dom Jackson Craft Cannabis |
| `budnked.png` | BudNked |
| `5-points.png` | Er What? |

Five filenames no longer match the brand's display name after historic
renames — `tilray.png` is Portal, `olli.png` is OBi, `hybrid-infusions.png` is
Virtue Cannabis, `canadas-island-garden.png` is FIGR, `5-points.png` is
Er What?. Trust the `alt`/`title` in the markup, not the filename.

`Divvy_Logo_New Navy.png` is in the folder but not on the wall.

## Adding one

PNG with a transparent background, 176px tall (the wall renders at
`max-height: 44px`), optimised to roughly 40 KB or less. Add a cell to
`<div class="producer-wall">` in `past-events.html` with matching `alt` and
`title`.
