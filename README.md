# Resort Multi-tenant Website Template (Next.js 16)

UI website template for multi-tenant resorts with a BFF layer for backend and central-platform integration.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Vercel deployment ready

## Tenant Isolation (Non-Negotiable)
Every UI/content/integration update must preserve tenant separation.

Each resort owner/site is isolated by:
- `tenantSlug` (public routing identity)
- `ownerId` (owner identity)
- `resortId` (resort identity)

Never mix content or data across resort owners.

## Content Source Priority (Always)
For website content, the fallback priority is:
1. Owner/tenant backend content
2. Central platform fallback content
3. Local static fallback content

This includes Home, Hero/Navbar-related content, and all extended homepage sections.

## Home Hero + Navbar Failover (Do Not Break)
- Primary source: `BACKEND_API_BASE_URL /site/home`
- Fallback source: `CENTRAL_API_BASE_URL /site/home`
- Last-resort fallback: local static tenant content

Editable home payload fields may come from backend/central, with static as final safety fallback.

## BFF Headers (Must Be Preserved)
When BFF forwards requests to backend/central systems, it sends:
- `x-tenant-slug`
- `x-tenant-id` (mapped from `resortId`)
- `x-resort-id`
- `x-owner-id`
- `x-internal-secret` (if configured)

## BFF API Contracts (Do Not Break)
- `GET /api/site/home`
- `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
- `POST /api/site/leads`

## Central Platform Responsibility
The central platform is responsible for:
- Approving/creating rental system accounts
- Opening tenant IDs or rental packages
- Managing central fallback content
- Coordinating with backend/admin systems

## Integration Safety Rules
- Do not weaken `backend -> central -> static` fallback behavior.
- Do not weaken tenant isolation by `tenantSlug`, `ownerId`, `resortId`.
- Do not introduce shared global tenant content, except explicit central fallback content.
- Do not change tenant registry semantics unless explicitly planned and documented.

## Delivery Rule for Every Completed UI/System Update
Before handoff to:
- Backend/admin system team
- Central platform team

Always update this `README.md` with:
- What was changed
- What contracts/fallback logic were preserved
- Any new content keys/fields and where they load from

## Formal Handoff Notice (Template Data + Owner ID Separation)
During the current handoff phase, all content shown in UI pages may be mock/template content for layout and behavior demonstration only.

This means:
- UI text/images/cards shown now are not always production business data.
- Production data authority will come from:
  1. Owner backend/admin system
  2. Central platform fallback
  3. Local static fallback (safety only)

Strict owner separation is mandatory for every request and payload:
- Separate each resort owner by `ownerId`.
- Separate each resort/site by `resortId`.
- Keep route-level identity by `tenantSlug`.
- Never mix content, availability results, leads, or admin edits across different `ownerId` / `resortId`.

Handoff requirement for backend/admin and central teams:
- Treat current UI content as template-safe defaults until live content integration is completed.
- Ensure write/read operations are scoped to the active tenant identity:
  - `tenantSlug`
  - `ownerId`
  - `resortId`
- Preserve BFF header forwarding and fallback chain exactly as documented in this README.

## Formal Payload Contract Examples (Home / Rooms / Leads)
These examples are reference contracts for backend/admin and central-platform integration during handoff.

Important:
- Public BFF endpoint contracts below remain unchanged.
- Tenant identity (`tenantSlug`, `ownerId`, `resortId`) must always be present in tenant context and request headers when BFF calls upstream systems.
- Do not return or consume cross-tenant data.

### 1) Home Contract (`GET /api/site/home`)
Public BFF contract:
- Method: `GET`
- Path: `/api/site/home` or `/api/site/{tenantSlug}/home`
- Query: none

Expected BFF upstream identity headers:
```http
x-tenant-slug: forest-escape
x-tenant-id: resort_001
x-resort-id: resort_001
x-owner-id: owner_001
x-internal-secret: <optional>
```

Reference response shape (simplified):
```json
{
  "tenant": {
    "tenantSlug": "forest-escape",
    "brand": "Forest Escape Resort",
    "locale": "th"
  },
  "hero": {
    "title": "Welcome",
    "subtitle": "Template content during handoff",
    "ctaLabel": "Book now",
    "heroImageUrl": "/images/hero.jpg"
  },
  "roomsFeaturedGallery": [],
  "homepageAmenities": {},
  "homepageHotelInfo": {},
  "contact": {
    "phone": "+66 89 000 1111",
    "email": "booking@example.com"
  },
  "footer": {}
}
```

Tenant-safety notes:
- Response must belong to exactly one tenant context.
- No field should be merged from another `ownerId` / `resortId`.

### 2) Rooms Contract (`GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`)
Public BFF contract:
- Method: `GET`
- Path: `/api/site/rooms` or `/api/site/{tenantSlug}/rooms`
- Query:
  - `checkIn`: `YYYY-MM-DD`
  - `nights`: integer `1..30`

Validation rules:
- `checkIn` must match ISO date format `YYYY-MM-DD`.
- `nights` must be an integer and inside `1..30`.
- Invalid query must not trigger cross-tenant fallback leakage.

Reference response shape (current compatible):
```json
[
  {
    "id": "room-deluxe-king",
    "name": "Deluxe King",
    "description": "Template room description",
    "nightlyPriceTHB": 3200,
    "imageUrl": "/images/rooms/deluxe-king.jpg",
    "badge": "Best seller"
  }
]
```

Reference extended response shape (optional upstream model):
```json
{
  "checkIn": "2026-05-10",
  "nights": 2,
  "currency": "THB",
  "totalAvailable": 2,
  "availableRooms": [],
  "unavailableRooms": []
}
```

Tenant-safety notes:
- Availability must be scoped to the current `tenantSlug` + `ownerId` + `resortId`.
- Never mix room inventory across owners.

### 3) Leads Contract (`POST /api/site/leads`)
Public BFF contract:
- Method: `POST`
- Path: `/api/site/leads` or `/api/site/{tenantSlug}/leads`
- Body (JSON):
```json
{
  "customerName": "John Doe",
  "phone": "+66 89 000 1111",
  "email": "john@example.com",
  "checkIn": "2026-05-10",
  "checkOut": "2026-05-12",
  "roomId": "room-deluxe-king",
  "message": "Need airport pickup"
}
```

Validation rules:
- `customerName` required.
- If provided, `email` must be valid format.
- If provided, `checkIn` / `checkOut` must be `YYYY-MM-DD`.
- If both dates exist, `checkOut` must be after `checkIn`.

Reference success response:
```json
{
  "ok": true,
  "referenceId": "LEAD-20260507-0001"
}
```

Tenant-safety notes:
- Lead submission must be written only under the active tenant identity.
- No lead from tenant A can be stored under tenant B (`ownerId` / `resortId` mismatch forbidden).

### Cross-System Tenant-Safety Checklist
- Always resolve tenant context before data read/write:
  - `tenantSlug`
  - `ownerId`
  - `resortId`
- Always forward BFF identity headers to backend/central systems.
- Keep fallback order unchanged:
  1. owner backend
  2. central platform fallback
  3. local static fallback
- Treat current UI data as template-safe defaults until full backend/central integration is complete.

## Latest Update (Rooms Section Migration)
- Homepage cleanup:
  - Removed the homepage Rooms intro/cards rendering from `src/components/resort-home.tsx`.
  - Hero, Navbar/Header, Booking/Search card, and Footer design were left intact.
- New/updated routes:
  - Added `GET page /rooms` route handler at `src/app/rooms/page.tsx` (tenant-aware redirect to `/site/{tenantSlug}/rooms`).
  - Added dedicated tenant rooms page `src/app/site/[tenantSlug]/rooms/page.tsx`.
  - Navbar menu route remains `ห้องพัก -> /rooms` in `src/components/top-navbar.tsx`.
- Content/API source used:
  - Rooms page loads room data via existing adapter flow `getContentAdapter().getRooms(tenantSlug, criteria)`.
  - Home page continues loading home payload via existing adapter flow `getContentAdapter().getSiteHome(tenantSlug)`.
  - Existing BFF endpoint contracts remain unchanged:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Tenant isolation notes:
  - Tenant context continues to resolve by existing identifiers and resolver flow:
    - `tenantSlug`, `ownerId`, `resortId`
  - No tenant registry schema changes.
  - No cross-tenant data mixing introduced.
- Fallback behavior notes:
  - Existing architecture and fallback design were preserved.
  - No changes to BFF forwarding headers:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)
  - No backend/central/static failover contract rewrites.
- Handoff notes:
  - Backend/admin team: no new API contract required for this change; existing room/home APIs remain the source.
  - Central platform team: no change to tenant provisioning flow; routing now includes tenant-specific Rooms page render path.

## Latest Update (Home Rooms Intro Static Lock)
- Added Rooms intro block back under Hero on homepage at `src/components/resort-home.tsx`.
- This specific intro block is now local static content in frontend code and is intentionally not sourced from backend/admin or central platform content.
- Multi-tenant routing, BFF headers, and fallback flow for other sections remain unchanged.

## Latest Update (Rooms Featured Gallery Section)
- Added a new visual featured room gallery section directly below Rooms intro on the Rooms page:
  - UI component: `src/components/resort-rooms-page.tsx`
  - Styles: `src/app/globals.css` (`.rooms-featured-*` selectors)
- New content key for admin/backend and central fallback:
  - `rooms.featuredGallery`
- New data shape (tenant-scoped):
  - `featuredGallery[]` item fields:
    - `id: string`
    - `title: string`
    - `sizeText: string`
    - `imageUrl: string`
    - `altText?: string`
    - `order?: number`
    - `isVisible?: boolean`
- Content model integration:
  - `SiteHomeDTO` extended with `roomsFeaturedGallery?: FeaturedGalleryItemDTO[]`
  - Sanitizer: `src/lib/content/rooms-featured-gallery.ts`
  - Home DTO normalization includes featured gallery sanitization.
- Fallback notes (preserved architecture):
  - Tenant backend source: `BACKEND_API_BASE_URL /site/home`
  - Central fallback source: `CENTRAL_API_BASE_URL /site/home`
  - Local static fallback source: `getStaticHomeByTenant(tenantSlug)` in `src/lib/tenants/static-content.ts`
  - In API mode, backend home payload will merge missing/invalid `roomsFeaturedGallery` from central when available.
- Tenant isolation notes:
  - Tenant context and data isolation remain based on `tenantSlug`, `ownerId`, and `resortId`.
  - BFF forwarding headers remain unchanged:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)
  - No tenant registry structure changes and no cross-tenant content mixing.
- Handoff notes:
  - Backend/admin team: can provide editable per-tenant `roomsFeaturedGallery` in `/site/home` payload.
  - Central platform team: can provide fallback `roomsFeaturedGallery` using the same key and shape for failover.

## Latest Update (Rooms Featured Gallery Rendering Fix)
- Fixed blank area below Rooms intro on Rooms page by making gallery rendering fail-safe in:
  - `src/components/resort-rooms-page.tsx`
- Root cause:
  - gallery items were filtered by `isVisible`, and when all incoming items were hidden, section did not render.
- Fix behavior:
  - Rooms featured gallery section now always renders on Rooms page.
  - If visible items from tenant/backend/central are empty, UI falls back to local static featured gallery items.
  - Fallback item IDs and labels now align with expected defaults:
    - `deluxe-king`
    - `deluxe-twin`
    - `deluxe-triple`
- Fallback chain remains unchanged:
  - tenant backend -> central platform -> local static fallback
- Tenant isolation unchanged:
  - `tenantSlug`, `ownerId`, `resortId` remain the isolation boundary
  - no cross-tenant data sharing introduced
- Handoff notes:
  - Backend/admin team: continue sending tenant-scoped `roomsFeaturedGallery`; optional `isVisible` is supported.
  - Central platform team: keep fallback payload tenant-safe; local static fallback is the final safety layer.

## Latest Update (Featured Gallery Moved To Homepage)
- Moved Featured Room Gallery image strip placement from Rooms page to homepage.
  - Added reusable component: `src/components/featured-room-gallery.tsx`
  - Homepage render: `src/components/resort-home.tsx` (below Rooms intro area)
  - Removed gallery strip render from `src/components/resort-rooms-page.tsx` to avoid duplication.
- Content key used:
  - `rooms.featuredGallery`
- Tenant isolation notes:
  - Tenant content remains resolved per request context (`tenantSlug`, `ownerId`, `resortId`)
  - No tenant registry structure changes
  - No cross-tenant gallery rendering introduced
- Backend/central/static fallback notes:
  - Fallback chain preserved: tenant backend -> central platform -> local static fallback
  - In API mode, if backend/central home payload lacks valid `roomsFeaturedGallery`, BFF now supplements from tenant static fallback.
- Handoff notes:
  - Backend/admin team: manage `rooms.featuredGallery` per tenant in home payload.
  - Central platform team: provide tenant-safe fallback values for `rooms.featuredGallery`; static remains final safety layer.

## Latest Update (Rooms Empty-State Copy Polish)
- Improved Rooms page empty-state messaging for clearer user guidance when no room results are available.
  - Updated localization key value: `ResortHome.roomsEmpty`
  - Updated locale files:
    - `messages/en.json`
    - `messages/th.json`
    - `messages/ja.json`
    - `messages/ko.json`
    - `messages/ru.json`
    - `messages/zh.json`
- Route and API contract notes:
  - No route changes.
  - No API contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Content key notes:
  - `rooms.featuredGallery` remains unchanged and still renders only on homepage.
  - Rooms page continues rendering full room listing/grid without duplicating featured gallery.
- Tenant isolation notes:
  - No changes to tenant isolation boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant content/data mixing introduced.
- Fallback behavior notes:
  - Preserved fallback chain: backend -> central -> static.
  - No changes to BFF forwarding headers:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team: no payload/schema change required for this update.
  - Central platform team: no fallback model change required for this update.

## Latest Update (Active Nav + Clickable Logo Home Link)
- Added `Active Navigation State` in Navbar/Header so the current page link is visually highlighted.
  - Implemented in: `src/components/top-navbar.tsx`
  - Active-route detection uses current pathname and maps tenant paths safely:
    - `/` and `/site/{tenantSlug}` -> หน้าแรก (`/`)
    - `/rooms` and `/site/{tenantSlug}/rooms` -> ห้องพัก (`/rooms`)
    - `/activities` and `/site/{tenantSlug}/activities` -> กิจกรรม (`/activities`)
    - `/about` and `/site/{tenantSlug}/about` -> เกี่ยวกับเรา (`/about`)
    - `/contact` and `/site/{tenantSlug}/contact` -> ติดต่อเรา (`/contact`)
- Added `Clickable Logo Home Link` (Logo Home Navigation).
  - Wrapped desktop and mobile logo areas with `Link` to `/`
  - Added accessibility label: `aria-label="Go to homepage"`
  - Preserved existing logo visual design and navbar layout.
- Minimal style updates for active nav state:
  - Updated in: `src/app/globals.css`
  - Active link keeps subtle premium styling with accent underline and readable text in both dark and light navbar interaction states.
- Routes affected:
  - `/`
  - `/rooms`
  - `/activities`
  - `/about`
  - `/contact`
- Backend/BFF/tenant behavior notes:
  - No backend API changes.
  - No BFF contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
  - No tenant isolation changes (`tenantSlug`, `ownerId`, `resortId`).
  - No changes to fallback order (`backend -> central -> static`) or forwarding headers (`x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` if configured).
- Handoff notes:
  - Backend/admin team: no payload/schema update required; this is a frontend navigation behavior improvement only.
  - Central platform team: no fallback content/data model change required; tenant-safe behavior remains unchanged.

## Latest Update (Homepage Services/Amenities Editable Model)
- Added a new Services/Amenities section above Footer on homepage render:
  - Render location: `src/components/resort-home.tsx`
  - New component: `src/components/homepage-amenities.tsx`
  - New styles: `src/app/globals.css` (`.amenities-*` selectors)
- Services/Amenities now supports up to 6 editable items, sorted by `order`, and renders only visible items.
- New content key:
  - `homepage.amenities`
- New structured data shape:
  - `homepageAmenities: {`
  - `  eyebrow: string`
  - `  heading: string`
  - `  isVisible?: boolean`
  - `  items: Array<{`
  - `    id: string`
  - `    iconKey: string`
  - `    title: string`
  - `    description: string`
  - `    order: number`
  - `    isVisible: boolean`
  - `  }>`
  - `}`
- Editable backend/admin fields (tenant-scoped):
  - add item
  - edit item
  - delete item
  - change `iconKey`
  - change `title`
  - change `description`
  - change `order`
  - enable/disable `isVisible`
- IconKey system:
  - Implemented iconKey-based internal SVG map (no new icon library):
    - `security-camera`
    - `laundry`
    - `shuttle`
    - `wifi`
    - `breakfast`
    - `support`
  - Unknown `iconKey` now renders a safe fallback icon.
- Add/edit/delete/reorder/visibility behavior:
  - Section sanitization supports structured item editing and stable IDs.
  - Items are sorted by `order`.
  - Only items with `isVisible !== false` are rendered.
  - Frontend enforces a max render count of 6 items.
- Tenant isolation notes:
  - No change to tenant isolation boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant content mixing introduced.
  - Amenities content remains resolved in current tenant request context only.
- Backend/central/static fallback notes:
  - Preserved fallback chain: tenant backend -> central platform -> local static fallback.
  - In API mode, backend home payload amenities fallback behavior:
    - invalid/missing backend amenities -> central amenities (if valid)
    - invalid/missing central amenities -> tenant static amenities fallback
  - Static fallback now includes 6 default amenities items.
  - No BFF header changes:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Persist `homepage.amenities` per tenant owner context.
    - Keep item `id` stable for edit/delete/reorder operations.
    - Do not share amenities payload across tenants.
  - Central platform team:
    - Provide tenant-safe fallback `homepage.amenities` with same shape.
    - Keep central fallback separate from tenant-owned backend content.

## Latest Update (Homepage Hotel Information Section)
- Added a new compact Hotel Information section on homepage.
  - Render location: `src/components/resort-home.tsx`
  - New component: `src/components/homepage-hotel-info.tsx`
  - Placement: above Footer, after existing homepage content sections (including amenities when present)
  - Not placed in Hero, Booking/Search card, Rooms page, or Footer body.
- New content key:
  - `homepage.hotelInfo`
- New structured data shape:
  - `homepageHotelInfo: {`
  - `  heading: string`
  - `  isVisible?: boolean`
  - `  items: Array<{`
  - `    id: string`
  - `    iconKey: string`
  - `    title: string`
  - `    description?: string`
  - `    order: number`
  - `    isVisible: boolean`
  - `  }>`
  - `}`
- Editable backend/admin fields (tenant-scoped):
  - add item
  - edit item
  - delete item
  - change `iconKey`
  - change `title`
  - change `description`
  - change `order`
  - enable/disable `isVisible`
- IconKey system:
  - Implemented iconKey-based internal SVG map (no new icon library):
    - `clock`
    - `check`
    - `bell`
    - `pet`
    - `parking`
    - `info`
  - Unknown `iconKey` uses safe fallback icon (`info`).
- Add/edit/delete/reorder/visibility behavior:
  - Frontend renders only visible items (`isVisible !== false`)
  - Frontend sorts by `order`
  - Section supports at least 6 editable items and is not locked to static text.
- Tenant isolation notes:
  - No change to tenant isolation boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant hotel information sharing introduced.
- Backend/central/static fallback notes:
  - Preserved fallback chain: tenant backend -> central platform -> local static fallback.
  - In API mode, hotel info in home payload follows same merge pattern:
    - invalid/missing tenant backend hotel info -> central fallback hotel info
    - invalid/missing central hotel info -> tenant static fallback hotel info
  - BFF headers preserved:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Manage `homepage.hotelInfo` per tenant owner context.
    - Keep item IDs stable for safe edit/delete/reorder workflows.
    - Ensure updates are tenant-scoped only.
  - Central platform team:
    - Provide fallback `homepage.hotelInfo` with same structure.
    - Keep central fallback content separate from tenant-owned content.

## Latest Update (Contact/Booking Section Moved To Contact Page)
- Moved the homepage Contact / Booking Request section to a dedicated Contact page.
  - Homepage source updated: `src/components/resort-home.tsx` (contact block removed)
  - New page component: `src/components/resort-contact-page.tsx`
  - New tenant contact route: `src/app/site/[tenantSlug]/contact/page.tsx`
  - New index route redirect: `src/app/contact/page.tsx` -> `/site/{tenantSlug}/contact`
- Contact route:
  - Navbar menu `ติดต่อเรา` continues using `/contact` and now resolves to tenant contact page via redirect.
- Contact content key/data shape used:
  - Reused existing home payload structures from `GET /api/site/home`:
    - `contact` (phone, email, lineId)
    - `footer.contact` (address, supportHours, phone, email)
  - Contact page reads tenant-scoped contact information from these existing structures; no separate API contract added.
- Lead submission/API notes:
  - Form submission behavior preserved.
  - Still uses `POST /api/site/leads` via existing `LeadForm` flow.
  - Tenant-specific lead endpoint pattern in frontend remains tenant-scoped (`tenantSlug` query) and backend tenant resolution remains enforced.
- Tenant isolation notes:
  - Tenant isolation boundaries unchanged:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant contact data rendering introduced.
  - No cross-tenant lead submission path introduced.
- Backend/central/static fallback notes:
  - Preserved fallback chain: tenant backend -> central platform -> local static fallback.
  - Contact page uses the same home-content load path and fallback behavior as the rest of homepage content.
  - BFF forwarding headers preserved:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Continue managing tenant-scoped contact fields in existing home payload structures (`contact`, `footer.contact`).
    - Ensure updates stay isolated by tenant owner/resort context.
  - Central platform team:
    - Continue providing fallback contact fields in central home payload for tenant-safe fallback behavior.
    - Keep central fallback separate from tenant-owned backend data.

## Latest Update (Homepage Featured Gallery Carousel + Editable Up To 6)
- Scope:
  - Updated only the homepage Featured Room Gallery behavior in:
    - `src/components/featured-room-gallery.tsx`
    - `src/app/globals.css` (`.rooms-featured-*` selectors)
    - `src/lib/content/rooms-featured-gallery.ts`
- Homepage Featured Gallery remains on homepage and is not moved to other pages.
- Content key/data shape:
  - Reused existing tenant-scoped key: `rooms.featuredGallery`
  - Item fields supported for backend/admin + central fallback:
    - `id`
    - `title`
    - `sizeText`
    - `imageUrl`
    - `altText`
    - `order`
    - `isVisible`
- Editable backend/admin behavior:
  - Supports add/edit/delete/reorder/visibility through structured item array.
  - Frontend now enforces max render capacity of 6 items.
  - Sanitizer guard also limits normalized content to max 6 items.
- Carousel left/right behavior:
  - Desktop: 3 visible cards per view.
  - Mobile: 1 visible card per view.
  - Arrows slide gallery by one item step and clamp at boundaries.
  - Disabled state is applied at start/end.
  - Accessibility labels added:
    - `aria-label="Previous gallery items"`
    - `aria-label="Next gallery items"`
- Rendering rules:
  - Only visible items (`isVisible !== false`) are rendered.
  - Items are sorted by `order`.
  - If no visible valid items remain, local static featured fallback items are used.
  - If backend/central provides more than 6 items, only first 6 after sort/filter are used.
- Tenant isolation notes:
  - No changes to tenant boundary identifiers:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant gallery content sharing introduced.
- Backend/central/static fallback notes:
  - Preserved fallback chain:
    - tenant backend -> central platform -> local static fallback
  - Preserved BFF identity header behavior:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Continue managing `rooms.featuredGallery` per tenant.
    - Keep `id` stable for safe edit/delete/reorder workflows.
    - Provide `order` and `isVisible` for deterministic rendering.
  - Central platform team:
    - Provide tenant-safe fallback `rooms.featuredGallery` with same structure.
    - Keep central content separate from owner backend content.

## Latest Update (Homepage Room Search Modal Flow)
- Added a new homepage `Room Search Modal` experience for the Hero Booking/Search card.
  - Updated component: `src/components/hero-booking-widget.tsx`
  - Updated styles: `src/app/globals.css` (`.room-search-modal-*` + related search state selectors)
- Modal state flow now supports:
  - `loading` (spinner + waiting message)
  - `success` (available rooms result cards)
  - `empty` (no availability + unavailable/full list when backend provides it)
  - `error` (safe retry/close flow with sanitized error text)
- API used (unchanged contract):
  - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
  - `GET /api/site/[tenantSlug]/rooms?checkIn=YYYY-MM-DD&nights=1..30`
- Validation behavior:
  - `checkIn` required and must match `YYYY-MM-DD`
  - `nights` required and must be integer between `1..30`
  - Friendly validation shown without changing unrelated homepage sections.
- Result model used in UI layer:
  - `RoomSearchResult`:
    - `checkIn`, `nights`, `currency`
    - `availableRooms[]`
    - `unavailableRooms[]`
    - `totalAvailable`
  - `RoomSearchRateItem`:
    - `id`, `roomId`, `name`, `imageUrl`, `detailsUrl`
    - `status` (`available` | `unavailable` | `full`)
    - `rateName`, `pricePerNight`, `currency`, `taxesIncludedText`, `description`
- UX and accessibility notes:
  - Modal opens immediately after valid Search click and dims background.
  - Duplicate search clicks are prevented while loading.
  - Modal has `role="dialog"`, `aria-modal="true"`, close button, escape key handling, and overlay close behavior (disabled during loading).
  - Focus is returned to Search button after close.
  - Mobile modal is scrollable and card layout stacks vertically.
- Tenant isolation notes:
  - Search requests remain tenant-scoped via existing BFF tenant resolution path.
  - Tenant identifiers and isolation boundaries unchanged:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant room availability mixing introduced.
- Backend/central/static fallback notes:
  - No backend architecture rewrite.
  - Existing content/request flow remains preserved; this update only changes homepage search UX rendering/state handling.
  - Existing BFF identity header forwarding behavior remains unchanged:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Continue providing tenant-safe room availability responses through existing rooms endpoint contract.
    - Optional extended fields (`status`, `rateName`, `detailsUrl`, `taxesIncludedText`) are now consumed when present.
  - Central platform team:
    - Keep any fallback behavior aligned with current BFF/tenant guard patterns.
    - Ensure fallback payloads do not cross tenant boundaries.

## Latest Update (Room Search Modal Positioning + i18n)
- Fixed Room Search Modal positioning so the modal no longer appears under the fixed Navbar/Header.
  - Updated UI component: `src/components/hero-booking-widget.tsx`
  - Updated modal CSS: `src/app/globals.css`
- Positioning/z-index updates:
  - Modal overlay now uses a high z-index (`9999`) and renders in a portal attached to `document.body`.
  - Added safe top spacing using existing header height variable:
    - `padding-top: calc(var(--top-navbar-h, 88px) + 24px)` on desktop
    - mobile safe spacing with `var(--top-navbar-h, 72px)`
  - Modal panel max height now respects header-safe viewport area:
    - `max-height: calc(100vh - var(--top-navbar-h, 88px) - 48px)`
  - Overlay remains scrollable for long result sets on mobile and desktop.
- Added i18n support for all Room Search Modal text (no hardcoded modal-only Thai text).
  - New message namespace: `RoomSearchModal`
  - Added keys for:
    - loading title/subtitle
    - available title/count
    - empty title/message
    - unavailable/full badge text
    - error title/message
    - retry/close/select actions
    - room details label
    - price-per-night and taxes/fees text
    - search summary labels (check-in, nights, currency)
    - validation and safe technical fallback text
  - Updated locale dictionaries:
    - `messages/th.json`
    - `messages/en.json`
    - `messages/zh.json`
    - `messages/ja.json`
    - `messages/ko.json`
    - `messages/ru.json`
- Fallback locale behavior:
  - Message loading now deep-merges fallback layers in this order:
    1. `en` base
    2. `th` fallback
    3. selected app locale override
  - Effective key fallback for missing values is `selected locale -> th -> en`.
  - Language tags not mapped as available app locales continue to resolve through existing app-locale mapping behavior (no selector/registry rewrite).
- Encoding/hardcoded text integrity fix:
  - Repaired corrupted Thai Room Search Modal strings that previously rendered as `?` placeholders.
  - Verified `RoomSearchModal` keys in active locale files (`th`, `en`, `zh`, `ja`, `ko`, `ru`) no longer contain placeholder `???` text.

## Latest Update (Modal Compact Sizing + Full i18n Audit)
- Reduced Room Search Modal length/footprint for better UX:
  - Updated `src/app/globals.css` and `src/components/hero-booking-widget.tsx`.
  - Base modal width reduced from large full-style panel to a more compact default.
  - Added status-specific modal sizing:
    - `loading`, `empty`, `error` now render in a narrower panel.
  - Reduced loading-state minimum height so the spinner view is not overly tall.
  - Preserved mobile scroll behavior and header-safe top spacing.
- Ran detailed translation audit across `messages/*.json` (excluding `RoomSearchModal` focus area):
  - Verified key parity against `en.json` baseline for active app locales (`th`, `en`, `zh`, `ja`, `ko`, `ru`).
  - Result: no missing keys, no empty values, no placeholder `???` sequences in non-`RoomSearchModal` keys.
- Tenant isolation/fallback/API notes:
  - No change to tenant logic (`tenantSlug`, `ownerId`, `resortId`).
  - No change to rooms API contract or BFF request flow.
  - Backend -> central -> static fallback behavior remains unchanged.
- Error text safety:
  - User-facing modal errors remain friendly/localized.
  - Raw sensitive/technical strings are filtered; sensitive tokens/headers/stack details are not exposed.
  - Development-only console logging remains behind existing `NODE_ENV !== "production"` guard.
- Tenant isolation/fallback notes:
  - No changes to tenant identifiers or isolation:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No changes to room API contracts or BFF routing.
  - Backend/central/static fallback architecture remains unchanged.
- Handoff notes:
  - Backend/admin team: no API contract change required; optional richer room availability fields continue to be supported by UI parsing.
  - Central platform team: no change to fallback responsibilities; continue tenant-safe fallback content behavior.

## Latest Update (Navbar Mobile Keyboard + Focus/Contrast Polish)
- Scope:
  - Updated only UI behavior/styles in:
    - `src/components/top-navbar.tsx`
    - `src/app/globals.css`
  - Updated context/backlog tracking:
    - `docs/PROJECT-CONTEXT.md`
    - `docs/UI-BACKLOG.md`
- Mobile navbar behavior updates:
  - Added `Escape` key close support while mobile menu is open.
  - Added focus management:
    - first mobile nav link receives focus on menu open
    - focus returns to mobile menu button when menu is closed by keyboard/button
  - Added `aria-controls` wiring between menu button and mobile nav panel.
  - Added keyboard tab-loop containment inside the open mobile nav panel.
- Focus-visible/contrast polish:
  - Added clearer focus-visible styles for:
    - mobile menu button
    - mobile close button
    - mobile nav links
    - logo link
    - Room Search Modal action controls (close/retry/select/details)
    - footer links and back-to-top control
  - Improved mobile nav active/hover row contrast for better readability.
- Section spacing rhythm polish:
  - Adjusted `.section` vertical spacing using responsive clamp values.
  - Added tighter mobile section spacing override for better rhythm on small screens.
- Tenant isolation notes:
  - No changes to tenant identity boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant content/data/leads mixing introduced.
- Backend/central/static fallback notes:
  - Preserved fallback chain exactly:
    - tenant backend -> central platform -> local static fallback
  - No changes to BFF identity header forwarding:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- API contract notes:
  - No changes to BFF public contracts:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Handoff notes:
  - Backend/admin team: no payload or schema changes required for this round.
  - Central platform team: no fallback schema changes required; tenant-safe fallback behavior unchanged.

## Latest Update (Redesigned Service Notice / Status Page)
- Scope:
  - Replaced raw tenant-facing load failure blocks with a modern status-based notice page UI:
    - `src/components/status-notice-page.tsx`
    - `src/lib/status-notice.ts`
    - `src/app/site/[tenantSlug]/page.tsx`
    - `src/app/site/[tenantSlug]/rooms/page.tsx`
    - `src/app/site/[tenantSlug]/contact/page.tsx`
    - `src/app/site/[tenantSlug]/error.tsx`
    - `src/app/not-found.tsx`
    - `src/app/site/[tenantSlug]/not-found.tsx`
    - `src/app/globals.css`
- Supported status types:
  - `network_issue`
  - `temporary_unavailable`
  - `maintenance`
  - `backend_unavailable`
  - `not_found`
  - `generic_error`
- Icon mapping (status -> iconKey):
  - `network_issue -> wifi-off`
  - `temporary_unavailable -> alert-circle`
  - `maintenance -> wrench`
  - `backend_unavailable -> server-off`
  - `not_found -> search-off`
  - `generic_error -> info-circle`
  - Unknown icon key fallback is safely handled by `info-circle`.
- Safe customer-facing error behavior:
  - Production no longer shows raw runtime/internal error strings to customers.
  - Raw details are classified to safe status types and rendered with friendly messages/actions.
  - Optional technical detail box is shown only in development mode and is sanitized to avoid sensitive tokens/headers.
- i18n support notes:
  - Added new `StatusNotice` namespace for all supported app locales (`th`, `en`, `zh`, `ja`, `ko`, `ru`).
  - Localized action labels and per-status title/message/help text are consumed via existing `next-intl` pipeline.
  - Existing message fallback behavior remains:
    - selected locale -> `th` -> `en`
- Tenant isolation notes:
  - No change to tenant identity boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - Notice actions are tenant-aware where applicable (`/site/{tenantSlug}` and `/site/{tenantSlug}/contact`).
  - No cross-tenant content/data/leads mixing introduced.
- Backend/central/static fallback notes:
  - No changes to BFF or content-adapter architecture.
  - Preserved fallback chain exactly:
    - owner backend -> central platform -> local static fallback
  - Preserved BFF forwarding headers:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)
- API contract notes:
  - No public BFF contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Handoff notes:
  - Backend/admin team:
    - No schema or endpoint change required for this redesign.
    - Optional upstream maintenance/error wording can still be sent, but customer UI now maps to safe status categories.
  - Central platform team:
    - No fallback payload shape changes required.
    - Continue tenant-safe fallback responsibility unchanged.

## Latest Update (Homepage Alternating Room Highlights Section)
- Scope:
  - Added a new alternating Room Highlights section on homepage and placed it between:
    - Rooms intro text section
    - Featured Room Gallery
  - Updated files:
    - `src/components/homepage-room-highlights.tsx`
    - `src/components/resort-home.tsx`
    - `src/app/globals.css`
    - `src/lib/content/homepage-room-highlights.ts`
    - `src/lib/types/site.ts`
    - `src/lib/dto/normalize.ts`
    - `src/lib/api/backend-client.ts`
    - `src/lib/tenants/static-content.ts`
- Placement:
  - Homepage section order now:
    - Hero/Banner
    - Rooms intro text
    - Alternating Room Highlights (new)
    - Featured Room Gallery
    - Remaining homepage sections
    - Footer
- New content key and data shape:
  - Content key: `homepage.roomHighlights`
  - DTO field: `homepageRoomHighlights`
  - Shape:
    - `isVisible?: boolean`
    - `items[]` with:
      - `id`
      - `title`
      - `subtitle?`
      - `description`
      - `buttonText?`
      - `buttonHref?`
      - `imageUrl`
      - `imageAlt?`
      - `imagePosition?: "left" | "right"`
      - `order`
      - `isVisible`
- Editable backend/admin fields:
  - add/edit/delete block
  - title, subtitle, description
  - button text, button href
  - image URL, image alt
  - image position
  - order
  - visibility toggle
- Max 4 block behavior:
  - Frontend enforces:
    - visible-only render (`isVisible !== false`)
    - sorted by `order`
    - capped at 4 items
  - If `imagePosition` is missing:
    - even index -> image left
    - odd index -> image right
- Image fallback behavior:
  - If item `imageUrl` is missing, frontend falls back to tenant-scoped existing room/gallery image sources.
  - If image fails to load, section renders a safe visual placeholder (no broken image icon).
- Tenant isolation notes:
  - No change to tenant boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - Room Highlights content is rendered only from current tenant context.
  - No cross-tenant content/image sharing introduced.
- Backend/central/static fallback notes:
  - Preserved fallback chain:
    - tenant backend -> central platform -> local static fallback
  - `fetchBackendHome` now merges `homepageRoomHighlights` with same fallback pattern as other homepage structured sections.
  - Existing BFF identity headers remain unchanged:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- API contract notes:
  - No changes to public BFF contracts:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Handoff notes:
  - Backend/admin team:
    - Manage `homepage.roomHighlights` per tenant with stable `id` values.
    - Keep content fully isolated by tenant owner/resort context.
  - Central platform team:
    - Provide tenant-safe fallback `homepage.roomHighlights` using same shape.
    - Keep central fallback separate from owner-managed backend content.

## Latest Update (Navbar Phone Contact Item)
- Scope:
  - Added a clickable tenant phone contact item in Navbar/Header, placed immediately after language selector.
  - Updated files:
    - `src/components/top-navbar.tsx`
    - `src/components/resort-home.tsx`
    - `src/components/resort-rooms-page.tsx`
    - `src/components/resort-contact-page.tsx`
    - `src/app/globals.css`
- UI behavior:
  - Desktop navbar right area now shows:
    - language selector
    - phone contact item (phone icon + number)
  - Phone item uses `tel:` link so click opens dial action (mobile and desktop-compatible).
  - Responsive handling:
    - compact styling to avoid wrapping
    - icon-only fallback on tighter screens (`768px-900px` and very small mobile panel) with accessible label preserved.
- Data/source behavior:
  - Navbar phone is not hardcoded as a separate source.
  - It is derived from current tenant home contact data:
    - primary: `home.contact.phone`
    - fallback: `footer.contact.phone`
  - This keeps phone content aligned with contact information already used by contact page sections.
- Tenant isolation notes:
  - No change to tenant identity boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - Navbar phone content is resolved per active tenant payload only.
  - No cross-tenant phone data exposure introduced.
- Backend/central/static fallback notes:
  - Existing home payload sourcing remains unchanged:
    - tenant backend -> central platform -> local static fallback
  - Navbar phone item automatically follows that same resolved tenant payload.
  - No changes to BFF identity headers:
    - `x-tenant-slug`
    - `x-tenant-id`
    - `x-resort-id`
    - `x-owner-id`
    - `x-internal-secret` (if configured)
- API contract notes:
  - No public contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
- Handoff notes:
  - Backend/admin team:
    - Continue maintaining tenant-scoped contact phone values in existing home payload.
- Central platform team:
  - Continue providing tenant-safe fallback contact phone values in central home payload.

## Latest Update (Full i18n Language Switching Completion)
- Scope:
  - Completed locale switching behavior across all supported locales without changing core UI layout architecture.
  - Updated files include:
    - `src/i18n/config.ts`
    - `src/i18n/messages.ts`
    - `src/lib/i18n/localized.ts`
    - `src/components/language-switcher.tsx`
    - `src/components/top-navbar.tsx`
    - `src/components/hero-booking-widget.tsx`
    - `src/components/featured-room-gallery.tsx`
    - `src/components/homepage-room-highlights.tsx`
    - `src/components/homepage-amenities.tsx`
    - `src/components/homepage-hotel-info.tsx`
    - `src/components/resort-home.tsx`
    - `src/components/resort-rooms-page.tsx`
    - `src/components/resort-contact-page.tsx`
    - `src/components/lead-form.tsx`
    - `src/lib/types/site.ts`
    - `messages/*.json` (all supported locales)
- Supported locales:
  - `th-TH`, `en-US`, `lo-LA`, `zh-CN`, `ja-JP`, `ko-KR`, `ru-RU`, `fr-FR`, `de-DE`, `es-ES`, `it-IT`, `pt-PT`, `id-ID`, `vi-VN`, `ms-MY`, `hi-IN`, `ar-SA`
- Core behavior completed:
  - Locale change updates translated UI text immediately on current page.
  - Selected locale is persisted in `localStorage` (`NEXT_LOCALE`) and restored on reload.
  - Cookie and query locale sync remain aligned with existing middleware/proxy flow.
  - Default locale remains `th-TH` when no stored/cookie locale exists.
  - Message fallback order is enforced as:
    - selected locale -> `th` -> `en`
- Translation safety and key parity:
  - Added/filled missing translation keys so all locale files now contain full `en.json` key parity.
  - Prevented missing-key crashes and avoided exposing raw translation keys in customer UI.
  - Language selector label localization improved per locale (e.g., Thai/Lao/Chinese/Japanese/Korean/Russian/French/etc.).
- Tenant content vs static translation behavior:
  - Added safe localized value helper (`getLocalizedValue`, `resolveLocalizedContent`) to support localized tenant fields with fallback:
    - selected -> `th` -> `en`
  - Static fallback translation overlays are applied only for static/fallback content paths in key homepage sections.
  - Backend/admin tenant-managed custom text is preserved and not blindly overwritten by static translation keys.
- Production-safe customer messaging:
  - Lead form unknown/raw backend error strings are now normalized to safe localized generic messages instead of exposing raw technical text.
  - Service Notice / Status Page i18n and safe customer-facing behavior remain preserved.
- Tenant isolation notes:
  - No change to tenant identity boundaries:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant localized content leakage introduced.
- Backend/central/static fallback notes:
  - Content source priority is unchanged:
    - owner backend -> central platform -> local static fallback
  - No changes to BFF contracts:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
  - No changes to BFF header forwarding:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)
- Handoff notes:
  - Backend/admin team:
    - Localized content fields can be provided safely using locale-keyed objects; frontend now resolves with `selected -> th -> en`.
    - Keep localized content tenant-scoped and never shared across `ownerId` / `resortId`.
  - Central platform team:
    - Keep centralized fallback locale payloads tenant-safe and schema-compatible with existing home payload structure.
    - Preserve role as fallback source only; do not override owner backend source precedence.

## Latest Update (Language Switcher Immediate Apply Fix)
- Scope:
  - Fixed language switching behavior where the dropdown selection changed but page text could remain stale.
  - Updated:
    - `src/components/language-switcher.tsx`
- Behavior fix:
  - Language change now writes cookie + localStorage and immediately triggers `router.refresh()` on current page.
  - Removed dependency on query-param redirect flow for primary locale switching interaction to avoid stale/mixed rendering state.
  - Existing proxy support for `?lang=` remains intact for URL-based locale entry points.
- Tenant isolation/fallback/API notes:
  - No tenant boundary changes (`tenantSlug`, `ownerId`, `resortId`).
  - No BFF contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
  - No fallback chain changes:
    - owner backend -> central platform -> local static fallback

## Latest Update (Home/Rooms/Contact Static Fallback i18n Audit + Fix)
- Scope:
  - Audited Home, Rooms, and Contact sections to ensure static fallback text reacts to language dropdown changes.
  - Added targeted fallback translation mapping helper:
    - `src/lib/i18n/static-fallback-text.ts`
  - Updated rendering in:
    - `src/components/resort-home.tsx`
    - `src/components/resort-rooms-page.tsx`
    - `src/components/resort-contact-page.tsx`
  - Updated locale dictionaries:
    - `messages/en.json`
    - `messages/th.json`
    - propagated missing new keys to all locale files (`messages/*.json`) without overwriting existing locale-specific values.
- Behavior fixed:
  - Static fallback hero copy (tenant demo/static payload), room card copy, footer description, system-link labels, and support-hour text now resolve via i18n mapping when they match known static fallback values.
  - This keeps tenant custom/backend content intact while ensuring local static fallback strings change with selected locale.
  - Home/Rooms/Contact key UI labels remain bound to `next-intl` keys and update immediately on locale change.
- Tenant safety:
  - No change to tenant identity separation:
    - `tenantSlug`
    - `ownerId`
    - `resortId`
  - No cross-tenant data/content mixing introduced.
- Fallback and API safety:
  - Preserved content fallback order exactly:
    - owner backend -> central platform -> local static fallback
  - No BFF/API contract changes:
    - `GET /api/site/home`
    - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
    - `POST /api/site/leads`
  - No BFF header forwarding changes:
    - `x-tenant-slug`, `x-tenant-id`, `x-resort-id`, `x-owner-id`, `x-internal-secret` (if configured)

## Environment Variables
See `.env.example`.

## Persistent Context For New Chats
- Project context: `docs/PROJECT-CONTEXT.md`
- UI backlog: `docs/UI-BACKLOG.md`
- New-chat bootstrap prompt: `docs/NEW-CHAT-BOOTSTRAP.md`

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
