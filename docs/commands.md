# Command registry

Node **24.17.0** (`.nvmrc`), npm lockfile, exact dependency versions. Run from the
repository root. Durations are small-project estimates.

| Purpose             | Command                  | Source of truth                       | Duration      | CPU      | Environment / ownership                          |
| ------------------- | ------------------------ | ------------------------------------- | ------------- | -------- | ------------------------------------------------ |
| Select runtime      | `nvm use`                | `.nvmrc`                              | <1 s          | Low      | Local, if nvm is installed                       |
| Install             | `npm ci`                 | package + lockfile                    | 10–60 s       | Moderate | Local and CI; network                            |
| Regenerate page     | `npm run generate`       | `tools/generate/`                     | <2 s          | Low      | Writes `index.html`                              |
| Generator freshness | `npm run generate:check` | `tools/generate/`                     | <2 s          | Low      | Deterministic; fails if `index.html` is stale    |
| Format              | `npm run format`         | Prettier                              | <10 s         | Low      | Local mutation                                   |
| Format gate         | `npm run format:check`   | Prettier                              | <10 s         | Low      | Deterministic                                    |
| Validate HTML/JS    | `npm run lint`           | `.htmlvalidate.json`, package scripts | <10 s         | Low      | Deterministic; no browser                        |
| Build               | `npm run build`          | `vite.config.js`                      | <10 s         | Moderate | Writes `dist/`                                   |
| Full gate           | `npm run check`          | package scripts + CI                  | <30 s         | Moderate | Deterministic; one at a time                     |
| Edit locally        | `npm run dev`            | package scripts                       | Until stopped | Low      | Loopback `127.0.0.1:5174`                        |
| Review build        | `npm run preview`        | package scripts                       | Until stopped | Low      | Loopback `127.0.0.1:4174`; serves the last build |

`npm run check` includes the build; do not start a duplicate build alongside it. CI runs
`npm ci` then `npm run check` and never deploys. Deployment commands live in
[deployment.md](deployment.md) because they mutate external services and need release
authority. There are no tests, migrations, backend or typecheck in this project; a passing
gate is not browser, accessibility or visual acceptance.
