# Project Context (Persistent)

Last updated: 2026-05-07

## Current Priority
- Finish website UI first.
- Keep backend integration contract stable while UI is being completed.

## Product Goal
- Multi-tenant resort website template.
- Support tenant separation by identity:
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

## Non-Negotiables
- Browser must not send owner identity directly.
- No cross-tenant data leakage.
- UI changes must preserve responsive behavior (mobile/tablet/desktop).

## Current Status
- Tenant identity model and BFF headers are in place.
- Website UI is partially complete and is the active workstream.
- Homepage Services/Amenities section now supports editable iconKey-based items with backend/central/static fallback integration.
- Homepage Hotel Information section now supports editable iconKey-based items with backend/central/static fallback integration.
- Contact/Booking request section has been moved out of homepage into dedicated tenant contact route rendering.
- Navbar mobile keyboard behavior is now polished (Escape close + focus management) and key interactive focus-visible states were improved for accessibility/contrast.
- Tenant load-failure surfaces now use a modern status-based customer notice page with safe production messaging and dev-only technical detail support.
- Homepage now includes a new alternating Room Highlights section between Rooms intro and Featured Room Gallery with tenant/backend/central/static fallback support.
- Navbar/Header now includes a tenant-scoped clickable phone contact item after language selector, using existing tenant contact data.
- Full i18n locale switching now supports 17 locales with shared language state (cookie + localStorage), selected-locale live updates, and consistent message fallback order (`selected -> th -> en`).

## Next UI Milestones
1. Finalize navigation and hero behavior.
2. Finalize room listing interactions and loading/empty states.
3. Finalize lead form UX states and error messaging consistency.
4. Run visual polish pass (spacing, hierarchy, mobile ergonomics).
5. Verify end-to-end flow with `CONTENT_MODE=api`.
