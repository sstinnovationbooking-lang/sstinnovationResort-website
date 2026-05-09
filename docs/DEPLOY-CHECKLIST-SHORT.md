# DEPLOY CHECKLIST (SHORT)

> ใช้สำหรับเช็กเร็วก่อนกด Deploy  
> โหมดปัจจุบัน: Template-first (ยังไม่ 100%)

## A) Pre-Deploy (Local/GitHub)

- [ ] `npm run typecheck` ผ่าน
- [ ] `npm run lint` ผ่าน
- [ ] ไม่มี secret/token ในไฟล์ที่ commit
- [ ] `.env.local` ไม่ถูก commit
- [ ] route หลักทดสอบแล้ว:
  - [ ] `/site/forest-escape`
  - [ ] `/site/forest-escape/rooms`

## B) Vercel Env (เลือกตามเป้าหมาย)

## Template Demo (Dev/Preview)
- [ ] `CONTENT_MODE=static`
- [ ] `NEXT_PUBLIC_TEMPLATE_BOOKING_MOCK=true`

## Live Integration (Production)
- [ ] `CONTENT_MODE=api`
- [ ] `NEXT_PUBLIC_TEMPLATE_BOOKING_MOCK=false`
- [ ] ตั้งค่า backend/central ครบ:
  - [ ] `BACKEND_API_BASE_URL`
  - [ ] `BACKEND_API_SECRET`
  - [ ] `CENTRAL_API_BASE_URL`
  - [ ] `CENTRAL_API_SECRET`

## C) Tenant Isolation Quick Check

- [ ] ใช้ลิงก์แบบ `/site/{tenantSlug}` เท่านั้น
- [ ] ข้อมูลไม่ปนข้าม tenant (`tenantSlug`, `ownerId`, `resortId`)
- [ ] BFF forwarding headers ยังครบ:
  - [ ] `x-tenant-slug`
  - [ ] `x-tenant-id`
  - [ ] `x-resort-id`
  - [ ] `x-owner-id`
  - [ ] `x-internal-secret` (ถ้ามี)

## D) Booking/UI Smoke Check

- [ ] เปลี่ยนภาษา `th-TH / en-US` ได้
- [ ] ไม่มี `????` หรือ missing translation
- [ ] ฟอร์มจอง: กรอกไม่ครบแล้วปุ่มจองกดไม่ได้
- [ ] เบอร์โทรต้อง 10 หลักไทย
- [ ] วันที่ย้อนหลัง / วันออกไม่เกินวันเข้า ถูกบล็อก

## E) Go/No-Go

- [ ] แจ้งทีมชัดเจนว่า Build นี้เป็น `Template` หรือ `Live`
- [ ] พร้อม Deploy

---

## Deploy Record (Quick)

| Date | Commit | Env | Mode | URL | Result | Note |
|---|---|---|---|---|---|---|
| YYYY-MM-DD |  | Dev/Preview/Prod | Template/Live | `/site/forest-escape` | ✅/❌ |  |

