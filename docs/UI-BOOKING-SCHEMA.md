# UI Booking Schema (Backend/Central Handoff)

This document defines the tenant-level booking package contract for `home.ui.booking`.

Use this object in the `/site/home` payload per tenant.

## Scope
- Path in payload: `ui.booking`
- Controls only Rooms booking behavior (`Book now / จองเลย`) in Room Detail Modal.
- Tenant isolation still mandatory by:
  - `tenantSlug`
  - `ownerId`
  - `resortId`

## JSON Schema
- File: `docs/schemas/ui.booking.schema.json`

## Field Contract
- `mode`: `"contact_only" | "booking_enabled"`
- `allowBookingForm`: `boolean`
- `contactRoute`: `string` starting with `/` (example: `/contact`)
- `paymentOptions`: array of `"deposit_50"` or `"full"`
- `defaultPaymentOption`: `"deposit_50" | "full"`
- `depositPercent`: integer `1..99` (normally `50`)

## Runtime Safety (Frontend Sanitizer)
- Invalid or missing values are normalized in:
  - `src/lib/content/site-ui.ts`
- Sanitizer defaults:
  - unknown mode -> `contact_only`
  - missing/invalid payment options -> `["full"]`
  - invalid default payment option -> first allowed option
  - invalid deposit percent with `deposit_50` -> `50`
  - missing/invalid contact route -> `/contact`

## Real Tenant Payload Examples
These examples match current tenant setup in this project.

### forest-escape (Booking Enabled + Deposit)
```json
{
  "tenant": {
    "tenantSlug": "forest-escape",
    "ownerId": "owner-sst-group",
    "resortId": "resort-forest-escape"
  },
  "ui": {
    "booking": {
      "mode": "booking_enabled",
      "allowBookingForm": true,
      "contactRoute": "/contact",
      "paymentOptions": ["deposit_50", "full"],
      "defaultPaymentOption": "deposit_50",
      "depositPercent": 50
    }
  }
}
```

### lake-serenity (Contact Only Package)
```json
{
  "tenant": {
    "tenantSlug": "lake-serenity",
    "ownerId": "owner-lake-hospitality",
    "resortId": "resort-lake-serenity"
  },
  "ui": {
    "booking": {
      "mode": "contact_only",
      "allowBookingForm": false,
      "contactRoute": "/contact",
      "paymentOptions": ["full"],
      "defaultPaymentOption": "full"
    }
  }
}
```

### demo-resort (Booking Enabled, Full Payment)
```json
{
  "tenant": {
    "tenantSlug": "demo-resort",
    "ownerId": "owner-demo",
    "resortId": "resort-demo"
  },
  "ui": {
    "booking": {
      "mode": "booking_enabled",
      "allowBookingForm": true,
      "contactRoute": "/contact",
      "paymentOptions": ["full"],
      "defaultPaymentOption": "full"
    }
  }
}
```

## Integration Notes (Backend/Central)
- Backend/central should return `ui.booking` already scoped to one tenant context only.
- Never return another tenant package policy in the same response.
- This schema does not change BFF public contracts:
  - `GET /api/site/home`
  - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
  - `POST /api/site/leads`

## CI Contract Test
- Script: `npm run test:contract:ui-booking`
- Aggregated contract suite: `npm run test:contracts`
