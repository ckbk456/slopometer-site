# Content and design

## Brand position

Slopometer is a free, independent Mac app with its own playful identity. Infinitex makes
it and is credited with a small "by Infinitex" link in the navigation and a footer credit.
It deliberately does **not** use the Infinitex brand system (Montserrat, brand blue) and is
not presented as an Infinitex commercial product or service. Decided by the owner on
18 October 2026; the Infinitex homepage links here only from its footer.

## Identity

- Display face: Fredoka Variable (weights 600–700, `--display`) for the wordmark, title,
  headings, marquee and card titles. Body: Bricolage Grotesque Variable. Both bundled from
  Fontsource at exact pinned versions (SIL OFL).
- Default palette: pistachio page tint, eggplant ink `#2A1636`, paper `#FBFDF5`, slop green
  `#116329` (the app's own activity color), goo `#7BC96F`, bubblegum `#FF8FB1`.
- Every themable color comes from `--l0`..`--l4`, `--slop`, `--goo` and the derived
  `--pistachio`. `--gum`, `--ink`, `--paper` and `--muted` stay fixed. `src/theme.js`
  overrides the themable ones from the app's 11 presets (`Sources/SlopometerCore/ThemePreset.swift`
  in the app repo), so the picker recolors the whole page. The choice is kept in
  `localStorage` under `slopometer-theme`.

## Structure

Hero (liquid title, tagline, download button, gauge) → gooey drips into a two-row marquee →
"The slop tray" (widget illustration and theme picker) → "Slop, plated five ways" chart
track → install steps beside "Today's menu" (username-only vs read-only token) → "Not a
slop detector." fine print → footer. Content is centered at `--wrap` (1240 px) with
full-bleed section backgrounds.

## Effects

All effects are local CSS/JS, fit the CSP, stop under `prefers-reduced-motion`, and pointer
effects need a fine pointer.

- Cursor-trailing blob, blurred on its own GPU layer and moved with `transform`.
- Liquid title: a `::before` copy of the text in `--slop`, cut by a sloshing wave mask.
- Sparkle gradient tagline with popping stars.
- Download button that leans toward the pointer anywhere on the page (at most 16 × 10 px),
  with a splat on click.
- Gauge (0–69, starts at 42): each tap adds 1–3 and always stops on 67 ("Six seven.") and
  69 ("Nice."). Past 69 it over-revs: it shakes, bulges, glows hot, puffs steam and warps
  through the `#warp` SVG displacement filter, with bigger jumps per tap. At 420 it bursts
  into shards and the count becomes an endless number about two screens wide: the first two
  digits count up, the first ~30 digits keep rerolling and jittering (tame at the head,
  wilder toward the tail), and later digits keep a one-time random scatter. Updates run on
  `requestAnimationFrame` at about 7 fps to stay cheap. Not a real count.
- Two flat marquee rows (no tilt, seamless loop).
- Widget illustration that tilts toward the pointer anywhere on the page; clicking a day
  sends a ripple across the grid.
- Chart track after camillemormal.com (via Hyperplexed): starts centered; pressing anywhere
  in the section and dragging half the window width moves it end to end; drags resume where
  the last stopped; charts pan inside their frames; each update is a 1.2 s `animate()`.
  Trackpad sideways swipes and arrow/Home/End keys on the focused track also move it.
- "slop-o-meter" scroll tube (1100 px and wider) that fills with scroll and, at the bottom
  of the page, blows its cap and sprays slop into a growing puddle.
- Install steps that pour in with scroll; jelly letters on the wordmark and headings
  (letters split into hidden spans, text kept as `aria-label`).

## Copy rules

- "Slop" is the joke. The page never claims AI-authorship or code-quality detection; the
  fine print says plainly that it counts contributions and PRs, can't spot AI code, judges
  nothing, ranks nobody and never writes to GitHub.
- Visible copy is for end users only: no "Sample data" or "drag to scroll" captions. The
  sample-data disclosure lives in each illustration's `role="img"` accessible name.
- Sample numbers are deliberately silly (42 today, 67 of 69 PRs).
- Facts come from the app's SPEC: macOS 14 or later; username-only reads the public
  profile calendar (not an official API); a read-only token adds PRs, private repos and the
  daily quota and is kept in Keychain; the app talks only to GitHub.
- Display text, numbers and illustrations are `user-select: none`.

## Illustrations

`tools/generate/art.mjs` draws the widget tiles and the five chart panels from one shared
96-day sample history ending today (a Thursday with 42), matching the app's views:

| Illustration                        | App source                                                     |
| ----------------------------------- | -------------------------------------------------------------- |
| Tray widget (large, grid style)     | `Shared/WidgetContent.swift`                                   |
| Grid, columns, line + 7-day average | `Shared/SlopChart.swift`, `MovingAverage.swift`                |
| Daily slop quota card               | `App/MainView.swift`, `Shared/QuotaMeter.swift`                |
| Menu bar panel                      | `App/MenuPanel.swift`, `MenuBarLabel` in `SlopometerApp.swift` |

Charts omit axis labels and legends because the track's panning would clip them. macOS
glass and translucency are drawn as flat fills. Recheck these when the app's views change.
