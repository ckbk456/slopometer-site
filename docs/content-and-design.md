# Content and design

## Brand position

Slopometer is a free, MIT-licensed Mac app with its own playful identity: Khang Cao's
personal project (© Khang Cao), hosted on Infinitex's domain. Infinitex is credited with a
small "hosted by Infinitex" link in the navigation and in the footer (owner's decision,
19 October 2026).
It deliberately does **not** use the Infinitex brand system (Montserrat, brand blue) and is
not presented as an Infinitex commercial product or service. Decided by the owner on
18 October 2026; the Infinitex homepage links here only from its footer.

## Identity

- Display face: Fredoka Variable (weights 600–700, `--display`) for the wordmark, title,
  headings, marquee and card titles. Body: Bricolage Grotesque Variable. Both bundled from
  Fontsource at exact pinned versions (SIL OFL).
- Default palette: the app's default preset, Slop Electric (levels `#93C5FD`, `#3B82F6`,
  `#4F46E5`, `#3730A3`, accent `#3730A3`, goo `#488DFF`, empty `#D4E6FB`), on a tinted page
  with eggplant ink `#2A1636`, paper `#FBFDF5`, and bubblegum `#FF8FB1`. Slop Green was
  removed from the app and the site.
- Every themable color comes from `--l0`..`--l4`, `--slop`, `--goo` and the derived
  `--pistachio`. `--gum`, `--ink`, `--paper` and `--muted` stay fixed. `src/theme.js`
  overrides the themable ones from the app's 10 presets (`Sources/SlopometerCore/ThemePreset.swift`
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
- Liquid title: a `::before` copy of the text in `--slop`, cut by a two-layer mask (a sloshing
  wave strip over a solid block) so the surface sits mid-way through the lowercase letters and
  descenders such as the p's tail fill too. Avoid `container-type` on the hero column: it
  clips the fill's descenders.
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
  fine print commits to the bit and says only that it won't judge your code (owner's
  decision, 27 October 2026).
- Visible copy is for end users only: no "Sample data" or "drag to scroll" captions, and
  no sample-data wording in accessible names either (owner's decision, 19 October 2026).
  Illustrations are named for what they show.
- Sample numbers are deliberately silly (42 today, 67 of 69 PRs).
- Facts come from the app's SPEC: macOS 14 or later; free and MIT-licensed; username-only
  reads the public profile calendar, which is not an official API and can break; a
  fine-grained read-only token adds PRs, private repos, repository filters and the daily
  quota, one token per organization, kept in Keychain. The page makes no network claim:
  the app also checks `updates.infinitex.vn` for updates, so "talks only to GitHub" would
  be false.
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
