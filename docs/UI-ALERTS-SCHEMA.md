# UI Alerts Schema (Backend/Central Handoff)

This document defines the tenant-level alert contract for `home.ui.alerts`.

Use this object in the `/site/home` payload per tenant.

## Scope
- Path in payload: `ui.alerts`
- Controls website notice behaviors:
  - Lock popup: maintenance
  - Lock popup: overdue payment
  - Non-lock top banner: maintenance window notice
- Tenant isolation is mandatory by:
  - `tenantSlug`
  - `ownerId`
  - `resortId`

## JSON Schema
- File: `docs/schemas/ui.alerts.schema.json`

## Field Contract
- `enabled`: `boolean` (optional)
- `mode`: `"none" | "lock_maintenance" | "lock_payment_overdue" | "banner_maintenance"`
- `noticeId`: `string` (recommended stable ID)
- `title`, `message`, `description`: localized text (`string` or `{ "th-TH", "en-US" }`)
- `bannerMessage`, `bannerDetail`: localized text
- `dismissible`: `boolean` (banner close button)
- `buttons`: optional popup actions
  - `label`: localized text
  - `href`: link
  - `style`: `"primary" | "secondary"`

## Runtime Safety (Frontend Sanitizer)
- Invalid payloads are sanitized in:
  - `src/lib/content/site-ui.ts`
- Supported legacy aliases for mode (for backward compatibility):
  - `maintenance_lock`, `lock_web_maintenance` -> `lock_maintenance`
  - `lock_overdue`, `payment_overdue_lock`, `overdue_payment` -> `lock_payment_overdue`
  - `maintenance_banner`, `maintenance_notice` -> `banner_maintenance`
- If `mode` is invalid, frontend falls back to `none`.

## Real Payload Examples

### 1) Lock popup: maintenance
```json
{
  "tenant": {
    "tenantSlug": "forest-escape",
    "ownerId": "owner-sst-group",
    "resortId": "resort-forest-escape"
  },
  "ui": {
    "alerts": {
      "enabled": true,
      "mode": "lock_maintenance",
      "noticeId": "maint-2026-05-12-01",
      "title": {
        "th-TH": "ขออภัย! เว็บไซต์กำลังปิดปรับปรุง",
        "en-US": "Sorry! This website is under maintenance"
      },
      "message": {
        "th-TH": "เพื่อการปรับปรุงระบบและหน้าเว็บไซต์",
        "en-US": "We are improving the system and website."
      },
      "description": {
        "th-TH": "กรุณากลับมาอีกครั้งภายหลัง",
        "en-US": "Please come back later."
      },
      "buttons": [
        {
          "label": {
            "th-TH": "กลับสู่หน้าแรก",
            "en-US": "Back to home"
          },
          "href": "/",
          "style": "primary"
        }
      ]
    }
  }
}
```

### 2) Lock popup: overdue payment
```json
{
  "tenant": {
    "tenantSlug": "lake-serenity",
    "ownerId": "owner-lake-hospitality",
    "resortId": "resort-lake-serenity"
  },
  "ui": {
    "alerts": {
      "enabled": true,
      "mode": "lock_payment_overdue",
      "noticeId": "billing-overdue-2026-05",
      "title": {
        "th-TH": "ไม่สามารถเข้าใช้งานเว็บไซต์ได้ เนื่องจากระบบมีค้างชำระ",
        "en-US": "Website access is locked due to overdue payment"
      },
      "message": {
        "th-TH": "กรุณาชำระค่าบริการที่ค้างชำระ",
        "en-US": "Please settle the outstanding payment."
      },
      "description": {
        "th-TH": "หากชำระแล้ว กรุณารอสักครู่หรือติดต่อเจ้าหน้าที่",
        "en-US": "If payment is completed, please wait or contact support."
      },
      "buttons": [
        {
          "label": {
            "th-TH": "ติดต่อเจ้าหน้าที่",
            "en-US": "Contact support"
          },
          "href": "/contact",
          "style": "secondary"
        },
        {
          "label": {
            "th-TH": "ตรวจสอบการชำระเงิน",
            "en-US": "Review payment status"
          },
          "href": "/contact?topic=payment",
          "style": "primary"
        }
      ]
    }
  }
}
```

### 3) Top banner (non-lock)
```json
{
  "tenant": {
    "tenantSlug": "demo-resort",
    "ownerId": "owner-demo",
    "resortId": "resort-demo"
  },
  "ui": {
    "alerts": {
      "enabled": true,
      "mode": "banner_maintenance",
      "noticeId": "maint-window-2026-05-25",
      "bannerMessage": {
        "th-TH": "แจ้งเพื่อทราบ: จะมีการปรับปรุงระบบและเว็บไซต์ ในช่วงเวลา 01:00 - 04:00 น.",
        "en-US": "Notice: System and website maintenance is scheduled from 01:00 - 04:00."
      },
      "bannerDetail": {
        "th-TH": "ในช่วงเวลาดังกล่าว อาจไม่สามารถใช้งานบางฟังก์ชันได้ ขออภัยในความไม่สะดวก",
        "en-US": "During this period, some features may be temporarily unavailable."
      },
      "dismissible": true
    }
  }
}
```

## Integration Notes
- Central system can trigger "all-tenant" notice in backend/central layer, but frontend still receives one resolved `ui.alerts` object per tenant response.
- Keep BFF contracts unchanged:
  - `GET /api/site/home`
  - `GET /api/site/rooms?checkIn=YYYY-MM-DD&nights=1..30`
  - `POST /api/site/leads`
- Keep i18n scope to `th-TH` and `en-US` for this website.

## CI Contract Test
- Script: `npm run test:contract:ui-alerts`
- Aggregated contract suite: `npm run test:contracts`
- Full handoff suite: `npm test`
- CI workflow step: `.github/workflows/deploy-vercel.yml` (`Handoff Test Suite`)
