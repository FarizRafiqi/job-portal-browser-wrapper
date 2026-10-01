# Private authenticated job browser worker

Extends the existing official LinuxServer Chromium visual workspace without migrating `/config`.
The authenticated read-only Playwright API uses the existing browser context. It never clicks Apply,
logs in, exports cookies, or uses LinkedIn. Raw CDP remains loopback-only; no socat forwarder.

## API (Docker internal only)
Base: `http://job-portal-browser:3030`. No public route or published port.
All endpoints require `Authorization: Bearer <token>`; token is generated once at
`/config/.job-worker/token` (0600) and persisted in the existing profile volume.
- GET `/health`: `{ "status": "ok" }` means API ready, not portal login proof.
- POST `/v1/discover`: `{ "portal": "glints" | "jobstreet", "url": "https://...", "limit": 3 }`.
  Glints path must be `/id/opportunities/jobs/explore`; JobStreet `/<keyword>-jobs`.
  `limit` is clamped to 1–5; output `jobs: [{title,url}]` contains deduplicated canonical detail links.
- POST `/v1/detail`: `{ "portal": "glints" | "jobstreet", "url": "https://..." }`.
  Glints requires `/id/opportunities/jobs/<slug>/<uuid>`; JobStreet `/job/<digits>`.
  Output: `{status,portal,url,authentication,collected_at,http_status,heading,page_title,
  text,text_truncated,structured_data,evidence:{url,excerpt}}`.

Only positive profile/account DOM indicators permit content output. Missing login yields
`login_required` or `authentication_unverified`; bot challenges `portal_blocked`;
expired vacancies `expired`; weak extraction `details_incomplete`. There is no public fallback.
Transport errors return 502 `authenticated_browser_unavailable`; concurrent request returns 429
`browser_busy`; bad targets 400; unauthenticated requests 401; all other routes 404.

Use 75-second client timeout, retry 429 serially. Navigation timeout 45 seconds plus bounded rendering
wait; detail text capped at 40,000 characters. Page is always closed, browser disconnected rather than
terminated. Session material and account headers are not returned.

HTTPS exact-host/path allowlists, cross-host top-level redirect rejection and non-public DNS/IP
checks protect against SSRF. Browser-subresource POST requests are allowed for rendering only;
API exposes no arbitrary actions/scripts or account-change operations. Target web content is untrusted.

`npm ci && npm test`. Five regression tests were introduced with individual RED→GREEN cycles.
Live extraction is additionally tested against preserved authenticated Chromium.

## Login and deployment
Existing protected workspace: `https://job-portal-browser.farizrafiqi.dev` (401 gate preserved).
The user alone handles passwords, OTPs and challenges. Existing profile volume:
`m3onw8661ybyq8r7ld3lr75n-chromium-glints-profile` mounted at `/config`.
Deploy existing Coolify application `m3onw8661ybyq8r7ld3lr75n`; public ports remain 3000/3001 only.
Pre-migration backup on server: `/data/coolify/backups/job-portal-browser/config-before-worker-20261001.tar.gz`.

Do not replace the browser profile, publish 3030/9222, or remove the existing access gate.
