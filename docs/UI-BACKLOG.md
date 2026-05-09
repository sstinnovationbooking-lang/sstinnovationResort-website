# UI Backlog (Website First)

Last updated: 2026-05-08

## In Progress
- Keep visual direction consistent across tenants while allowing tenant branding.
- Round update (2026-05-06): navbar overflow polish, hero booking copy/loading, room-card hierarchy, lead-form notice UX.
- Round update (2026-05-07): room-list empty-state copy updated across locales.
- Round update (2026-05-07): navbar active navigation state + clickable logo home link added.
- Round update (2026-05-07): homepage services/amenities section added with editable 6-item iconKey model and fallback support.
- Round update (2026-05-07): homepage hotel information section added with iconKey model and backend/central/static fallback support.
- Round update (2026-05-07): contact/booking section moved from homepage to dedicated tenant contact route.
- Round update (2026-05-07): mobile navbar keyboard handling polished (Escape close, focus flow) and global focus-visible/contrast states improved.
- Round update (2026-05-07): redesigned tenant load-failure page into modern status-based Service Notice UI with safe production messaging.
- Round update (2026-05-07): added homepage alternating Room Highlights section (up to 4 blocks) between Rooms intro and Featured Room Gallery.
- Round update (2026-05-07): added Navbar phone contact item after language selector with responsive compact/icon-only behavior.
- Round update (2026-05-07): completed full i18n language switching across all supported locales with key parity and safe locale fallback behavior.
- Round update (2026-05-08): homepage oversized Gallery section replaced with compact Activities cards grid (max 6) using structured `homepage.activities` content fallback flow.
- Round update (2026-05-08): Activities i18n missing-key issue addressed by adding required nested `ResortHome.activities.*` keys with legacy-key compatibility fallback in the Activities component.
- Round update (2026-05-08): homepage language stabilization pass added localized tenant text resolution support and safe locale fallback behavior (`selected -> th -> en`) for homepage content rendering.
- Round update (2026-05-08): active website language selector options temporarily reduced to Thai and English only, with unsupported persisted locales auto-reset to Thai default.
- Round update (2026-05-08): completed Thai homepage UI localization parity for `ResortHome` nav/section labels and media modal controls to ensure full two-language switching consistency.

## TODO (Short Term)
- [ ] Navbar
  - [ ] Sticky behavior QA on mobile.
  - [x] Link spacing and overflow polish on small screens.
- [ ] Hero booking widget
  - [x] Improve label clarity and button copy consistency.
  - [x] Improve loading state feedback.
- [ ] Room cards
  - [x] Unify card heights and price hierarchy.
  - [x] Improve empty state copy.
- [ ] Lead form
  - [x] Improve validation message readability.
  - [x] Improve success/error visual distinction.
- [ ] Global polish
  - [ ] Tighten section spacing rhythm.
  - [x] Recheck contrast and focus-visible states.

## QA Checklist
- [ ] 360px width layout
- [ ] 768px width layout
- [ ] 1024px+ layout
- [x] Keyboard navigation
- [ ] No layout shift on data load
