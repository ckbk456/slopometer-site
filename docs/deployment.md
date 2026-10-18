# Deployment

## Current state

Not deployed. No Cloudflare Pages project, DNS record or custom domain exists for this site
yet (as of 18 October 2026). CI only validates.

## Release gate

Do not deploy publicly until a signed, notarized `Slopometer.dmg` for the current release
is live at `https://updates.infinitex.vn/slopometer/Slopometer.dmg`. The download button points there, and it 404s until the app's release
job publishes it. That location belongs to the app: the same R2 bucket behind
`updates.infinitex.vn` holds the Sparkle feed (`/slopometer/appcast.xml`) and update
archives, so the download and the updater always come from one place (see the app's
`docs/logic/updates.md`). This site hosts neither the DMG nor the feed.

## Target

- Host: Cloudflare Pages, Direct Upload (no Git integration, no Functions).
- Account: the Infinitex Cloudflare account (`c9a7358c7ea70834588cfcefa86a0130`).
- Proposed project name: `slopometer-site`, production branch label `main`.
- Domain: `slopometer.infinitex.vn` as a Pages custom domain in the existing `infinitex.vn`
  zone. Do not touch the apex `infinitex.vn` records or email routing.

Creating the project, attaching the domain and each deployment need explicit authority.

## Release steps

1. Confirm the release gate above, release authority, and a clean, merged `main`.
2. `npm ci && npm run check` with the pinned Node version.
3. Deploy `dist/` with pinned Wrangler (authenticate securely; never commit tokens):

   ```sh
   CLOUDFLARE_ACCOUNT_ID=c9a7358c7ea70834588cfcefa86a0130 \
     npx --yes wrangler@4.137.0 pages deploy dist --project-name slopometer-site --branch main
   ```

4. Verify the deployment URL, then the custom domain: HTTPS, page and assets load, a real
   404 for unknown paths, security headers and CSP from `public/_headers`, a clean console,
   and that the download button fetches the DMG from `updates.infinitex.vn`.
5. Record the deployment ID, URL and the exact Git commit in this file.

## Rollback

Use the Pages deployment history to roll back to the previous production deployment after
inspecting its state and getting rollback authority.

References: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/),
[custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[headers](https://developers.cloudflare.com/pages/configuration/headers/).
