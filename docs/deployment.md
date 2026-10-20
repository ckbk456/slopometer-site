# Deployment

## Current state

Live on `https://slopometer.infinitex.vn` (Cloudflare Pages project `slopometer-site`,
Direct Upload). CI only validates.

| Date       | Deployment                                                                            | Site commit | App release |
| ---------- | ------------------------------------------------------------------------------------- | ----------- | ----------- |
| 2026-10-20 | `1571f76e-7fdf-4dc6-8710-0b85fb76ba0c` (`https://1571f76e.slopometer-site.pages.dev`) | `670ed85`   | 1.0.1       |

Verified after the first deployment: HTTPS on both URLs, page and assets load, unknown
paths return 404, the `public/_headers` CSP and security headers are served, and the
download button points at the live, notarized `Slopometer.dmg`.

## Release gate

Do not deploy publicly until the signed, notarized disk image for the release named in
`tools/generate/build.mjs` is live at
`https://updates.infinitex.vn/slopometer/Slopometer-<version>.dmg`. The download button
points there, and it 404s until the app's release publishes it.

The button links to a versioned file, never to a fixed "latest" name: every release gets a
new URL, so a browser or proxy cannot serve an older installer from cache. The app's 1.0.2
release exposed this when a browser kept handing out its cached 1.0.1 `Slopometer.dmg`
after the file had been replaced. Each app release therefore needs a site release: bump
`release` in `tools/generate/build.mjs`, run `npm run generate`, and deploy.

That location belongs to the app: the same R2 bucket behind
`updates.infinitex.vn` holds the Sparkle feed (`/slopometer/appcast.xml`) and update
archives, so the download and the updater always come from one place (see the app's
`docs/logic/updates.md`). This site hosts neither the DMG nor the feed.

## Target

- Host: Cloudflare Pages, Direct Upload (no Git integration, no Functions).
- Account: the Infinitex Cloudflare account (`c9a7358c7ea70834588cfcefa86a0130`).
- Project: `slopometer-site`, production branch label `main`.
- Domain: `slopometer.infinitex.vn` as a Pages custom domain in the existing `infinitex.vn`
  zone. Do not touch the apex `infinitex.vn` records or email routing.

Creating the project, attaching the domain and each deployment need explicit authority.

## Release steps

1. Confirm the release gate above (`curl -I` the versioned DMG URL returns 200), release
   authority, and a clean, merged `main`.
2. `npm ci && npm run check` with the pinned Node version.
3. Deploy `dist/` with pinned Wrangler (authenticate securely; never commit tokens):

   ```sh
   CLOUDFLARE_ACCOUNT_ID=c9a7358c7ea70834588cfcefa86a0130 \
     npx --yes wrangler@4.137.0 pages deploy dist --project-name slopometer-site --branch main
   ```

4. Verify the deployment URL, then the custom domain: HTTPS, page and assets load, a real
   404 for unknown paths, security headers and CSP from `public/_headers`, a clean console,
   and that the download button fetches `Slopometer-<version>.dmg` for the current release
   from `updates.infinitex.vn`.
5. Record the deployment ID, URL and the exact Git commit in this file.

## Rollback

Use the Pages deployment history to roll back to the previous production deployment after
inspecting its state and getting rollback authority.

References: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/),
[custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[headers](https://developers.cloudflare.com/pages/configuration/headers/).
