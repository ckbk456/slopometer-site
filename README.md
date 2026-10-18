# Slopometer site

The download website for [Slopometer](https://github.com/ckbk456/slopometer): a free macOS
menu-bar app and desktop widget that shows one GitHub account's contributions and pull
requests. _Your daily slop, quantified._ Made by [Infinitex](https://infinitex.vn).

Planned address: **https://slopometer.infinitex.vn** (not live yet; see
[docs/deployment.md](docs/deployment.md)).

## Quick start

Requires Node 24 (`.nvmrc`).

```sh
npm ci
npm run dev        # http://127.0.0.1:5174
npm run check      # the full gate CI runs
```

`index.html` is generated. Change `tools/generate/template.html` or
`tools/generate/art.mjs`, then run `npm run generate`.

## Docs

- [AGENTS.md](AGENTS.md): working agreement for people and coding agents
- [docs/](docs/README.md): content and design rules, commands, deployment
- [testing/MANUAL TO-DO](testing/MANUAL%20TO-DO/README.md): human checks before release

## Stack

Static HTML, CSS and a little browser JavaScript, built with Vite and served from
Cloudflare Pages. No backend, analytics, cookies or third-party requests. Fonts
(Fredoka and Bricolage Grotesque, SIL OFL) are bundled from Fontsource.
