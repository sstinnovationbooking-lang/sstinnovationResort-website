# Final Handover Readiness Report (2026-05-11 Round 3)

## Project
- Repository: `E:\sstinnovationResort-website`
- Scope: Single Template + Multi-tenant
- Stack: Next.js 16 App Router + TypeScript + Vercel + BFF
- Latest commit (HEAD): `8e09b5f`

## Round Scope Completed
1. Integrated API payload mapping for `CONTENT_MODE=api`:
- `home.ui.alerts`
- `aboutPage`
- `articlesPage`

2. Added contract + integration tests for handoff CI:
- `ui.alerts` schema contract test
- `ui.booking` schema contract test
- map embed resolver safety tests
- api payload mapping/fallback integration tests

3. Added handoff smoke route script for required tenant routes.

## Code-level Highlights
- Added/updated payload sanitization:
  - `src/lib/content/page-payload.ts`
  - `src/lib/dto/normalize.ts`
  - `src/lib/content/site-ui.ts`
- Added backend/central fallback merge for new payload parts (without contract break):
  - `src/lib/api/backend-client.ts`
- About page now supports additional backend fields:
  - subtitle/content/image
- Articles page now supports:
  - slug/publishedAt/category aliases

## Tests Added
- `scripts/test-ui-alerts-contract.js`
- `scripts/test-ui-booking-contract.js`
- `scripts/test-integration-suite.js`
- `scripts/smoke-handoff.js`

### NPM scripts added/updated
- `test:contract:ui-alerts`
- `test:contract:ui-booking`
- `test:contracts`
- `test:integration`
- `test`
- `smoke:handoff`

## CI Update
- Workflow updated: `.github/workflows/deploy-vercel.yml`
- Added unified step: `npm test`

## Quality Validation (Local)
- `npm run test:contracts`: pass
- `npm run test:integration`: pass
- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run smoke:handoff`: pass

## Production Verification (2026-05-11)
- Production domain verified: `https://sstinnovationresort-website.vercel.app`
- GitHub Actions:
  - Workflow: `Deploy Vercel (Production)`
  - Run: #18
  - Commit: `8e09b5ffdbbf678de5904c9a25c39b63b95a0b25`
  - Status: `completed / success`
  - URL: `https://github.com/sstinnovationbooking-lang/sstinnovationResort-website/actions/runs/25638889886`
- Production smoke results:
  - `/` -> `200` (redirect target: `/site/forest-escape`)
  - `/site/demo-resort` -> `200`
  - `/site/demo-resort/rooms` -> `200`
  - `/site/forest-escape` -> `200`
  - `/site/forest-escape/rooms` -> `200`
  - `/site/tenant-not-found` -> `404`
- Tenant isolation checks:
  - `demo-resort` response does not include `forest-escape` marker text.
  - `forest-escape` response does not include `demo-resort` marker text.
  - Unknown tenant remains `404` and does not fall back to another tenant.
- API/payload safety checks in production:
  - `/api/site/{tenantSlug}/home` returns `200` for both `demo-resort` and `forest-escape`.
  - `home.ui.alerts`, `aboutPage`, `articlesPage` can be absent without frontend crash (safe fallback confirmed).
- Map embed resolver checks in production:
  - Google embed URL -> `embedSrc` returned.
  - `maps.app.goo.gl` short link -> resolved and `embedSrc` returned.
  - non-Google URL -> `embedSrc: null` (unsafe embed blocked).

## Tenant Isolation / Headers / Fallback Status
- Tenant isolation: preserved (`tenantSlug`, `ownerId`, `resortId`)
- BFF headers: unchanged
  - `x-tenant-slug`
  - `x-tenant-id`
  - `x-resort-id`
  - `x-owner-id`
  - `x-internal-secret`
- Fallback chain: unchanged
  1. owner backend
  2. central platform
  3. local static

## Known Limitations
- `articles` detail route by slug is not introduced in this round (list page supports slug field and safe fallback link only).
- Production browser-level visual sign-off for alert modal/banner states is still required.
- Backend/central live payload has not yet provided populated `home.ui.alerts`, `aboutPage`, `articlesPage` on production APIs.

## Waiting for Backend/Central Confirmation
- Final live payload examples per owner for:
  - `home.ui.alerts`
  - `aboutPage`
  - `articlesPage`
- Production `CONTENT_MODE=api` credentials and access policy sign-off.

## Current Readiness
- Status: **Ready for production handoff package (frontend scope)**
- External production release: **pending backend/central final sign-off**
