# HANDOVER CHECKLIST (Single Template + Multi-tenant)

Use this checklist before final handoff to backend/admin team and central platform team.

Project scope now:
- Single website template
- Multi-tenant routing (`/site/{tenantSlug}`)
- Tenant isolation required (`tenantSlug`, `ownerId`, `resortId`)

---

## 1) Release Gate (Must Pass)

- [x] GitHub Actions `Deploy Vercel (Production)` is green on `main`
- [x] Deployment commit is recorded
- [x] Production URL is reachable
- [ ] No secret/token is committed in repository

---

## 2) Environment and Secrets

- [ ] GitHub `Environment: production` contains:
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] Vercel project production env is correct for current mode
- [ ] `.env.local` is not committed

---

## 3) Core Architecture Validation

- [x] Tenant route works: `/site/{tenantSlug}`
- [x] About route works: `/site/{tenantSlug}/about`
- [x] Articles route works: `/site/{tenantSlug}/articles`
- [x] Rooms route works: `/site/{tenantSlug}/rooms`
- [x] Contact route works: `/site/{tenantSlug}/contact`
- [x] i18n only uses `th-TH` and `en-US`
- [x] Default locale is `th-TH`
- [x] Locale persistence works (cookie/localStorage)

---

## 4) Tenant Isolation Validation

- [x] No cross-tenant content/data leakage
- [x] Active tenant context is always preserved in UI and API flow
- [x] Isolation keys are preserved end-to-end:
- [x] `tenantSlug`
- [x] `ownerId`
- [x] `resortId`

---

## 5) BFF and Header Forwarding

- [x] BFF forwards required headers:
- [x] `x-tenant-slug`
- [x] `x-tenant-id`
- [x] `x-resort-id`
- [x] `x-owner-id`
- [x] `x-internal-secret` (when configured)
- [x] Public BFF contracts are unchanged:
- [x] `GET /api/site/home`
- [x] `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
- [x] `POST /api/site/leads`

---

## 6) Fallback Chain Validation

- [x] Fallback order is unchanged:
- [x] Owner backend
- [x] Central platform
- [x] Local static fallback
- [x] Error path still returns safe UI behavior

---

## 7) Functional Smoke Test

- [x] Home page loads correctly for at least 2 tenants
- [x] About/Articles routes load for at least 2 tenants
- [x] Rooms zone filter works and keeps tenant scope
- [x] Contact map renders from Google map link/embed
- [ ] Alert modes render correctly from `ui.alerts`
- [x] No broken text or missing translation keys

---

## 8) Build Quality

- [x] `npm run lint` passes
- [x] `npm run typecheck` passes
- [x] `npm run build` passes

---

## 9) Handover Package

- [x] Share production URL and tested tenant URLs
- [x] Share current deploy commit SHA
- [ ] Share env/secrets ownership (who rotates and manages)
- [x] Share API contract docs and fallback behavior summary
- [x] Share `ui.booking` and `ui.alerts` payload docs
- [x] Share known limitations and next-phase plan

---

## 10) Sign-off Record

- [ ] Product/PM sign-off
- [ ] Frontend sign-off
- [ ] Backend/Admin sign-off
- [ ] Central platform sign-off
- [ ] Deployment owner sign-off

Completion date:
- [ ] YYYY-MM-DD

Release mode:
- [ ] Template demo mode
- [ ] Live integration mode

---

## Final Review Snapshot (2026-05-11)

- [x] Local quality gates passed:
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] Local smoke route checks passed:
- [x] `/site/demo-resort/articles`
- [x] `/site/forest-escape/articles`
- [x] `/site/demo-resort`
- [x] `/site/demo-resort/rooms`
- [x] `/site/demo-resort/camping`
- [x] `/site/demo-resort/contact`
- [x] `/site/forest-escape`
- [x] `/site/tenant-not-found` (returns HTTP 404 in local smoke)
- [x] Contact page map iframe rendered in smoke response checks
- [x] Production smoke re-check passed on `https://sstinnovationresort-website.vercel.app`
- [x] `/` -> `200` (redirects to `/site/forest-escape`)
- [x] `/site/demo-resort` -> `200`
- [x] `/site/demo-resort/rooms` -> `200`
- [x] `/site/forest-escape` -> `200`
- [x] `/site/forest-escape/rooms` -> `200`
- [x] `/site/tenant-not-found` -> `404`
- [x] Latest deploy commit on production workflow: `8f3f8e37a129c2c1dceefe2c61df77a7dd8e85ec`
- [x] GitHub Actions run: `Deploy Vercel (Production)` #19 = `success`
- [ ] Pending backend/central final sign-off for live payload population (`home.ui.alerts`, `aboutPage`, `articlesPage`)

---

## Final Review Snapshot (2026-05-16)

- [x] Frontend HEAD recorded: `364ae10`
- [x] Website GitHub Actions is green:
- [x] `Deploy Vercel (Production)` `success` -> `https://github.com/sstinnovationbooking-lang/sstinnovationResort-website/actions/runs/25930611289`
- [x] Owner backend latest commit + CI recorded:
- [x] Commit `64b65c3`
- [x] `Backend CI` `success` -> `https://github.com/sstinnovationbooking-lang/sstinnovation-backend-owner/actions/runs/25934347600`
- [x] Central backend latest commit + CI recorded:
- [x] Commit `dc204dc`
- [x] `Backend CI` `success` -> `https://github.com/sstinnovationbooking-lang/sstinnovation-backend-central/actions/runs/25934336513`
- [x] Production smoke re-check passed on `https://sstinnovationresort-website.vercel.app`
- [x] `/` -> `200`
- [x] `/site/demo-resort` -> `200`
- [x] `/site/demo-resort/rooms` -> `200`
- [x] `/site/forest-escape` -> `200`
- [x] `/site/forest-escape/rooms` -> `200`
- [x] `/site/tenant-not-found` -> `404`
- [x] Tenant API checks passed:
- [x] `/api/site/demo-resort/home` -> `200` (`tenantSlug=demo-resort`)
- [x] `/api/site/forest-escape/home` -> `200` (`tenantSlug=forest-escape`)
- [x] `/api/site/tenant-not-found/home` -> `404`
- [x] Owner/Central backend route smoke checks passed:
- [x] owner `/health` `/site/home` `/site/about` `/site/articles` -> `200`
- [x] central `/health` `/site/home` -> `200`
- [x] Manual backend/central sign-off package created:
- [x] `docs/HANDOVER-REPORT-2026-05-16.md`
- [ ] Pending backend/central live payload sign-off (`home.ui.alerts`, `aboutPage`, `articlesPage`)
