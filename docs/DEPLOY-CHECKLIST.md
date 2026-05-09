# DEPLOY CHECKLIST (Template Phase)

> สถานะปัจจุบัน: โปรเจกต์ยังอยู่ช่วงพัฒนา **เทมเพลตแรก** (ยังไม่ 100%)  
> เป้าหมายตอนนี้: เดโม่เว็บไซต์แบบ Multi-tenant บน Vercel ด้วยโปรเจกต์เดียว  
> รูปแบบลิงก์: `https://SST-INNOVATION.vercel.app/site/{tenantSlug}`

---

## 1) แนวทางสถาปัตยกรรมที่ใช้งานตอนนี้

- [ ] ใช้ **Vercel โปรเจกต์เดียว**
- [ ] แยก tenant ด้วย path: `/site/{tenantSlug}`
- [ ] รักษา tenant isolation: `tenantSlug`, `ownerId`, `resortId`
- [ ] ช่วงเทมเพลตใช้ข้อมูล mock/static ได้
- [ ] เมื่อ backend + central พร้อม ค่อยสลับเป็น live integration 100%

---

## 2) GitHub Checklist (ก่อน Push)

- [ ] ตรวจว่า `.env.local` **ไม่ถูก commit**
- [ ] ตรวจว่า token/secret ไม่มีในไฟล์ที่จะ push
- [ ] อัปเดต `.env.example` ให้ตรงค่าที่ทีมต้องใช้
- [ ] รันคำสั่งตรวจโค้ด
  - [ ] `npm run typecheck`
  - [ ] `npm run lint`
- [ ] ตรวจ route สำคัญในเครื่อง:
  - [ ] `/site/forest-escape`
  - [ ] `/site/forest-escape/rooms`
- [ ] Commit message ชัดเจนและสื่อผลกระทบ
- [ ] Push ไป branch ที่ต้องการ deploy

---

## 3) Vercel Environment Checklist

## Development / Preview (เดโม่เทมเพลต)
- [ ] `NEXT_PUBLIC_TEMPLATE_BOOKING_MOCK=true`
- [ ] `CONTENT_MODE=static`
- [ ] `DEFAULT_TENANT=forest-escape`

## Production (เมื่อพร้อม live)
- [ ] `NEXT_PUBLIC_TEMPLATE_BOOKING_MOCK=false`
- [ ] `CONTENT_MODE=api`
- [ ] ตั้งค่า backend/central ครบ:
  - [ ] `BACKEND_API_BASE_URL`
  - [ ] `BACKEND_API_SECRET`
  - [ ] `CENTRAL_API_BASE_URL`
  - [ ] `CENTRAL_API_SECRET`

---

## 4) Tenant Route Checklist (ก่อนส่งลิงก์ลูกค้า)

- [ ] ลิงก์หลักใช้งานได้: `https://SST-INNOVATION.vercel.app/site/forest-escape`
- [ ] ห้องพักใช้งานได้: `https://SST-INNOVATION.vercel.app/site/forest-escape/rooms`
- [ ] ถ้ามี tenant เพิ่ม:
  - [ ] `/site/{tenantSlugใหม่}` เปิดได้
  - [ ] ข้อมูลไม่ปนข้าม tenant
- [ ] Navbar ไป Rooms ได้ทั้ง desktop/mobile

---

## 5) Functional Smoke Test (Template Phase)

- [ ] i18n ทำงาน: `th-TH` / `en-US`
- [ ] ไม่มีข้อความ `????` หรือ missing-key บนหน้าเว็บ
- [ ] ปุ่มจองในฟอร์ม:
  - [ ] กรอกไม่ครบ -> ปุ่ม `จองเลย` ต้องกดไม่ได้
  - [ ] เบอร์โทรไม่ครบ 10 หลัก -> กดไม่ได้
  - [ ] วันที่ย้อนหลัง -> กดไม่ได้
  - [ ] วัน check-out ต้องมากกว่า check-in
- [ ] ไม่มี modal ซ้อนทับ navbar ผิดชั้น
- [ ] หน้า rooms แสดงผลได้ไม่พังทั้ง mobile/desktop

---

## 6) Integration Readiness (ก่อนส่งต่อทีม Backend/Central)

- [ ] ระบุชัดว่า release นี้เป็น **template/demo**
- [ ] ส่งรายการ field ที่ backend ต้องรองรับ (home/rooms/leads/booking ui)
- [ ] ยืนยัน fallback order:
  - [ ] owner backend
  - [ ] central platform
  - [ ] local static fallback
- [ ] ยืนยัน header forwarding ฝั่ง BFF:
  - [ ] `x-tenant-slug`
  - [ ] `x-tenant-id`
  - [ ] `x-resort-id`
  - [ ] `x-owner-id`
  - [ ] `x-internal-secret` (ถ้าตั้งค่า)

---

## 7) Deploy Approval Gate (ติ๊กก่อนกด Deploy จริง)

- [ ] Code quality ผ่าน (`typecheck` + `lint`)
- [ ] ไม่มี secret หลุดใน commit
- [ ] Env ถูกต้องตาม environment
- [ ] Tenant routes ทดสอบแล้ว
- [ ] แจ้งทีมว่า build นี้เป็น Template หรือ Live
- [ ] พร้อมกด Deploy

---

## 8) Deploy Log (บันทึกทุกครั้ง)

| Date | Branch/Commit | Env Target | Mode (Template/Live) | URLs Tested | Result | Note |
|---|---|---|---|---|---|---|
| YYYY-MM-DD |  | Dev / Preview / Prod |  | `/site/forest-escape` | ✅/❌ |  |

---

## 9) Quick Copy Checklist (ใช้ซ้ำก่อน Deploy ทุกครั้ง)

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] check `.env.local` ไม่ถูก commit
- [ ] verify Vercel env (mock/live ถูก environment)
- [ ] verify `/site/{tenantSlug}` และ `/site/{tenantSlug}/rooms`
- [ ] verify tenant isolation
- [ ] deploy + smoke test รอบสุดท้าย

