# Project Context (Persistent)

Last updated: 2026-05-11

## Current Priority
- Stabilize handoff quality for frontend + backend/admin + central platform.
- Keep architecture contract fixed while expanding tenant UI features.

## Product Goal
- Single-template, multi-tenant resort website.
- Tenant separation by identity:
  - `tenantSlug` (routing/public identity)
  - `ownerId` (owner identity)
  - `resortId` (resort identity)

## Architecture Snapshot
- Frontend: Next.js App Router.
- BFF endpoints: `/api/site/home`, `/api/site/rooms`, `/api/site/leads`.
- BFF resolves tenant from host/path and forwards identity headers:
  - `x-tenant-slug`
  - `x-tenant-id` (mapped from `resortId`)
  - `x-resort-id`
  - `x-owner-id`
  - `x-internal-secret` (when configured)

## Non-Negotiables
- Browser must not send tenant owner identity directly.
- No cross-tenant data leakage.
- Keep fallback chain unchanged: backend -> central -> static.
- UI must remain responsive on desktop/tablet/mobile.

## i18n Scope (Current)
- Supported website locales: `th-TH`, `en-US`
- Default locale: `th-TH`
- Locale persistence: cookie + localStorage (`NEXT_LOCALE`)

## Current Status
- Tenant-aware About and Articles routes are active:
  - `/site/[tenantSlug]/about`
  - `/site/[tenantSlug]/articles`
- Top navbar has About submenu with tenant-aware Articles link.
- Rooms page supports tenant zone model and zone-based listing/filter flow.
- Contact page map renderer supports Google iframe + Google short links with resolver API fallback.
- Central alert system is integrated via `home.ui.alerts`:
  - lock popup: maintenance
  - lock popup: overdue payment
  - top banner notice: maintenance window

## Handoff Docs (Latest)
- `docs/UI-BOOKING-SCHEMA.md`
- `docs/UI-ALERTS-SCHEMA.md`
- `docs/schemas/ui.booking.schema.json`
- `docs/schemas/ui.alerts.schema.json`
- `docs/HANDOVER-REPORT-2026-05-11.md`

## Next Milestones
1. Connect real central/backoffice payloads for `aboutPage`, `articlesPage`, and `ui.alerts` in production data paths.
2. Add browser-level visual regression checks for popup/banner/map behavior.
3. Final cross-team sign-off for live integration mode (`CONTENT_MODE=api`).
