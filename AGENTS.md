# Slopometer site agent contract

The download website for [Slopometer](https://github.com/ckbk456/slopometer), a free macOS
menu-bar app and desktop widget for one GitHub account's activity. Intended home:
`https://slopometer.infinitex.vn`. Brand position: an independent product with its own
playful identity, endorsed with a small "by Infinitex" credit. It does not follow the
Infinitex brand system and is not listed as an Infinitex product or service.

## Communication and authority

- Communicate in English. Give constructive, critical feedback on product and design choices.
- Questions, reviews, investigations, recommendations and plans are read-only: no file edits,
  installs, builds, Git changes or service changes.
- An explicit implementation request authorizes bounded local work and validation.
  Pushing a branch or opening a PR needs explicit publication authority. Merging, deploying,
  DNS or Cloudflare changes, and destructive actions each need exact authority.
- Never print tokens or commit credentials. Keep `.env*`, `.dev.vars*` and `.wrangler/` out of Git.
- Do not rename the task or chat unless asked.

## Product and content rules

Read [docs/content-and-design.md](docs/content-and-design.md) before changing copy, visuals or
effects. Key rules:

- "Slop" is the playful name for counted activity. Never claim AI-authorship or code-quality
  detection, ranking or grading.
- Visible copy is end-user facing only; no developer notes. Illustrations carry their
  sample-data disclosure in their accessible names. Sample numbers stay obviously silly
  (42 today, 67 of 69 PRs).
- Illustrations must match the app's real SwiftUI views; recheck them when the app's views
  change. Theme presets mirror the app's `ThemePreset.swift`.
- Product facts (requirements, data sources, token storage) come from the app repository's
  `SPEC.md` and `SCOPE.md`. Do not invent capabilities.
- The product name is "Slopometer"; "slop-o-meter" appears only as the scroll tube label.

## Source of truth

- `index.html` is **generated**. Edit `tools/generate/template.html` (markup and copy) or
  `tools/generate/art.mjs` (widget and chart illustrations), then run `npm run generate`.
  `npm run check` fails if `index.html` is stale.
- `src/main.js` and `src/style.css` hold the page effects; `src/theme.js` and `src/theme.css`
  hold the color presets and picker.
- Strict CSP in `public/_headers`: no inline scripts, no inline `style` attributes, no
  third-party origins. Setting CSS custom properties through CSSOM is fine.
- All motion must stop under `prefers-reduced-motion`; pointer effects need a fine pointer.

## Git and ownership

- `main` is the integration branch. Work on `codex/<short-kebab-case-task>` branches in an
  isolated worktree based on the latest verified `origin/main`.
- Inspect status, remotes, worktrees and running processes before editing. Never stash,
  reset, overwrite or absorb unrelated work. Never force-push or rewrite `main`.
- One coherent concern per branch and PR. Multi-agent work is optional and only for
  independent, non-overlapping file scopes; the primary agent owns shared contracts,
  combined validation and the merge recommendation. Agent reports are evidence to verify.

## Commands and processes

The [command registry](docs/commands.md) lists every command. The deterministic gate is
`npm run check` (format check, generator freshness, HTML and JS validation, Vite build).
Run one CPU-intensive command at a time, never watch mode in automation, and only stop
processes you started. `npm run dev` and `npm run preview` bind to loopback ports 5174 and 4174.

## Documentation, testing and delivery

- Update the owning doc and [testing/MANUAL TO-DO/README.md](testing/MANUAL%20TO-DO/README.md)
  in the same change as behavior or content.
- Browser automation needs an explicit request. Capturing screenshots is not manual QA.
- Human review owns copy, visual and effect acceptance, cross-browser behavior, accessibility
  and release approval.
- CI validates only; it never deploys. Deployment steps and the release gate live in
  [docs/deployment.md](docs/deployment.md). Do not deploy publicly until a signed, notarized
  `Slopometer.dmg` is attached to a public release of `ckbk456/slopometer`.
- Handoffs distinguish implemented, locally validated, CI passed, manually verified, PR open,
  merged and deployed. Never invent PR numbers or claim unrun checks.
