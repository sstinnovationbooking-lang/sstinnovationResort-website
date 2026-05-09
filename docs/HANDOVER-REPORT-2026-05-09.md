# Final Handover Readiness Report (2026-05-09)

## Project
- Repository: `E:\sstinnovationResort-website`
- Scope: Single Template + Multi-tenant
- Stack: Next.js 16 App Router + TypeScript + Vercel + BFF

## Production URL
- Working production domain from smoke checks:
  - `https://sstinnovationresort-website.vercel.app/`
- Tenant routes validated:
  - `https://sstinnovationresort-website.vercel.app/site/demo-resort`
  - `https://sstinnovationresort-website.vercel.app/site/demo-resort/rooms`

## Commit SHA (Latest)
- `909049f` (latest confirmed successful production deploy run)

## GitHub Actions Status
- Workflow: `Deploy Vercel (Production)`
- Status: Green (confirmed)

## Release Gate (Local)
- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass

## Environment / Secrets Required
- GitHub Actions / Vercel deployment:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Runtime content integration:
  - `CONTENT_MODE`
  - `BACKEND_API_BASE_URL`
  - `BACKEND_API_SECRET`
  - `CENTRAL_API_BASE_URL` (recommended for fallback)
  - `CENTRAL_API_SECRET` (recommended for fallback)

## API / Header Contract (Must Keep)
- Public BFF endpoints:
  - `GET /api/site/home`
  - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
  - `POST /api/site/leads`
- Required forwarded headers:
  - `x-tenant-slug`
  - `x-tenant-id`
  - `x-resort-id`
  - `x-owner-id`
  - `x-internal-secret` (when configured)

## Tenant Isolation Review
- Tenant identity remains route-based (`/site/[tenantSlug]`).
- Frontend does not send custom owner/resort identity directly from UI request payload.
- Upstream identity forwarding is generated in BFF from resolved tenant context.
- Fallback tenant identity fields (`ownerId`, `resortId`) come from tenant registry/backend contract path.

## Fallback Chain Review
- Confirmed code path keeps:
  1. Owner backend
  2. Central platform
  3. Local static fallback

## Production Smoke Notes
- Root `/`: HTTP 200
- `/site/demo-resort`: HTTP 200
- `/site/demo-resort/rooms`: HTTP 200
- `/site/tenant-not-found`: HTTP 200 (requires business sign-off whether this is expected UX)

## Known Limitations / Open Confirmations
- Canonical public domain to share with external stakeholders should be finalized (legacy domain variants exist in docs/history).
- Unknown tenant currently returns HTTP 200 page response instead of explicit 404 status in production smoke checks.
- Locale smoke in headless HTTP checks did not prove server-side cookie redirect behavior (`?lang=` flow); browser-level validation with UI switcher is required before final external sign-off.

## Backend / Central Team Must Confirm
- Owner/backend payload completeness for home/rooms/leads under tenant scope.
- Central fallback payload readiness and schema compatibility.
- Final decision on unknown-tenant UX/status behavior.
- Live-mode env readiness (`CONTENT_MODE=api`) and secret ownership/rotation process.

## Final Readiness
- Status: **Not Ready (conditional)**
- Reason: core deploy/build is healthy, but final cross-team sign-offs above are still pending.
