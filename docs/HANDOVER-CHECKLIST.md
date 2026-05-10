# HANDOVER CHECKLIST (Single Template + Multi-tenant)

Use this checklist before final handoff to backend/admin team and central platform team.

Project scope now:
- Single website template
- Multi-tenant routing (`/site/{tenantSlug}`)
- Tenant isolation required (`tenantSlug`, `ownerId`, `resortId`)

---

## 1) Release Gate (Must Pass)

- [ ] GitHub Actions `Deploy Vercel (Production)` is green on `main`
- [ ] Deployment commit is recorded
- [ ] Production URL is reachable
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

- [ ] Tenant route works: `/site/{tenantSlug}`
- [ ] About route works: `/site/{tenantSlug}/about`
- [ ] Articles route works: `/site/{tenantSlug}/articles`
- [ ] Rooms route works: `/site/{tenantSlug}/rooms`
- [ ] Contact route works: `/site/{tenantSlug}/contact`
- [ ] i18n only uses `th-TH` and `en-US`
- [ ] Default locale is `th-TH`
- [ ] Locale persistence works (cookie/localStorage)

---

## 4) Tenant Isolation Validation

- [ ] No cross-tenant content/data leakage
- [ ] Active tenant context is always preserved in UI and API flow
- [ ] Isolation keys are preserved end-to-end:
- [ ] `tenantSlug`
- [ ] `ownerId`
- [ ] `resortId`

---

## 5) BFF and Header Forwarding

- [ ] BFF forwards required headers:
- [ ] `x-tenant-slug`
- [ ] `x-tenant-id`
- [ ] `x-resort-id`
- [ ] `x-owner-id`
- [ ] `x-internal-secret` (when configured)
- [ ] Public BFF contracts are unchanged:
- [ ] `GET /api/site/home`
- [ ] `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
- [ ] `POST /api/site/leads`

---

## 6) Fallback Chain Validation

- [ ] Fallback order is unchanged:
- [ ] Owner backend
- [ ] Central platform
- [ ] Local static fallback
- [ ] Error path still returns safe UI behavior

---

## 7) Functional Smoke Test

- [ ] Home page loads correctly for at least 2 tenants
- [ ] About/Articles routes load for at least 2 tenants
- [ ] Rooms zone filter works and keeps tenant scope
- [ ] Contact map renders from Google map link/embed
- [ ] Alert modes render correctly from `ui.alerts`
- [ ] No broken text or missing translation keys

---

## 8) Build Quality

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

---

## 9) Handover Package

- [ ] Share production URL and tested tenant URLs
- [ ] Share current deploy commit SHA
- [ ] Share env/secrets ownership (who rotates and manages)
- [ ] Share API contract docs and fallback behavior summary
- [ ] Share `ui.booking` and `ui.alerts` payload docs
- [ ] Share known limitations and next-phase plan

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
- [ ] Production smoke re-check and sign-off still required before external release
