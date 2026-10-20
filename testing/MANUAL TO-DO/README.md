# Manual checks

Human-owned checks. Tick them against a named build or deployment; a passing `npm run check`
does not cover any of these.

## Before the first public deployment

- [ ] A signed, notarized `Slopometer-<version>.dmg` for the release in
      `tools/generate/build.mjs` is live at `https://updates.infinitex.vn/slopometer/`, and the
      download button fetches it.
- [ ] Owner approves the copy, the "by Infinitex" credit and the overall look.

## Page

- [ ] Effects in Safari, Chrome and Firefox: cursor blob, liquid title (theme-colored fill
      inside the outline), sparkle tagline, jelly letters, download button lean and splat,
      widget tilt and tile ripple, theme picker, chart track drag (smooth glide, starts
      centered, resumes where it stopped; mouse, touch, trackpad, arrow keys when focused),
      install reveal.
- [ ] Gauge: 42 at load; taps add 1–3 and stop on 67 and 69; past 69 it shakes, bulges,
      warps and glows; it bursts at 420; the runaway number keeps going without freezing the
      page. Check the warp filter in Safari.
- [ ] Slop-o-meter tube fills with scroll and bursts into a puddle at the bottom (1100 px
      and wider).
- [ ] Layout at 2000, 1440, 1050, 768 and 390 px: centered within about 1240 px, no
      horizontal scroll at 390 px (the burst number is allowed to overflow on purpose).
- [ ] Slop Electric is the default on a first visit (no Slop Green preset), every color
      preset recolors the page with readable text, and the choice survives a reload.
- [ ] Illustrations still match the current app views (widget, charts, quota card, menu bar).
- [ ] Reduced motion turns every animation off; touch devices get no cursor effects; the page
      stays readable with JavaScript disabled.
- [ ] Keyboard: skip link, focus rings, theme picker arrow keys, chart track keys.

## Every deployment

- [ ] Custom domain over HTTPS, security headers present, console free of CSP errors,
      unknown paths return the 404 page.
