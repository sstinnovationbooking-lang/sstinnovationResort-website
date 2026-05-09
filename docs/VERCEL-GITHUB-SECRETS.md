# Vercel + GitHub Secrets Setup (Step by Step)

เอกสารนี้ใช้ตั้งค่า Secrets สำหรับ workflow:

- `.github/workflows/deploy-vercel.yml`

เพื่อให้ deploy ขึ้น Vercel อัตโนมัติ โดยไม่ต้อง `vercel login` ในเครื่อง

---

## ต้องมี Secrets อะไรบ้าง

ตั้งใน GitHub Repository Secrets (Actions) จำนวน 3 ตัว:

1. `VERCEL_TOKEN`
2. `VERCEL_ORG_ID`
3. `VERCEL_PROJECT_ID`

---

## A) หา `VERCEL_TOKEN` (ทีละคลิก)

1. เข้า `https://vercel.com`
2. คลิกโปรไฟล์มุมขวาบน
3. เข้า `Settings`
4. ไปที่ `Tokens`
5. คลิก `Create Token`
6. ตั้งชื่อเช่น `github-actions-deploy`
7. คลิกสร้าง แล้วคัดลอก token เก็บทันที (จะแสดงครั้งเดียว)

---

## B) หา `VERCEL_ORG_ID` และ `VERCEL_PROJECT_ID` (ทีละคลิก)

วิธีที่ง่ายที่สุด:

1. ในเครื่องโปรเจกต์นี้ ต้องมีไฟล์ `.vercel/project.json`
2. เปิดไฟล์นี้ จะเห็นค่าประมาณ:

```json
{
  "projectId": "prj_xxxxxxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxxxxxx",
  "projectName": "sstinnovationresort-website"
}
```

แมปค่าดังนี้:

- `VERCEL_PROJECT_ID` = ค่า `projectId`
- `VERCEL_ORG_ID` = ค่า `orgId`

---

## C) ตั้ง Secrets ใน GitHub (ทีละคลิก)

1. เข้า GitHub repo ของคุณ
2. ไปที่ `Settings`
3. เมนูซ้าย `Secrets and variables` > `Actions`
4. คลิก `New repository secret`
5. เพิ่มทีละตัว:

- Name: `VERCEL_TOKEN` -> Secret: `<token จาก Vercel>`
- Name: `VERCEL_ORG_ID` -> Secret: `<orgId/teamId>`
- Name: `VERCEL_PROJECT_ID` -> Secret: `<projectId>`

---

## D) ทดสอบ Deploy Workflow

1. Push โค้ดไป branch `main`
2. ไปที่ GitHub repo > `Actions`
3. เปิด workflow: `Deploy Vercel (Production)`
4. ตรวจว่า job ผ่านครบทุก step
5. เปิด URL โปรดักชันเพื่อตรวจ route:
   - `/site/forest-escape`
   - `/site/forest-escape/rooms`

---

## E) Troubleshooting เร็ว

ถ้าเจอ `The specified token is not valid`:
- สร้าง `VERCEL_TOKEN` ใหม่ แล้วอัปเดตใน GitHub Secrets

ถ้าเจอ `Project not found`:
- ตรวจ `VERCEL_ORG_ID` และ `VERCEL_PROJECT_ID` จาก `.vercel/project.json`

ถ้าเจอ deploy ผ่านแต่หน้าไม่ขึ้น:
- ตรวจ Environment Variables ใน Vercel Project
- ตรวจว่า route `/site/{tenantSlug}` มีอยู่จริงใน build ล่าสุด

---

## หมายเหตุสำคัญ

- ห้ามใส่ token ลงไฟล์ `.env.local` แล้ว commit
- ให้เก็บ token เฉพาะใน GitHub Secrets / Vercel Project Settings เท่านั้น

