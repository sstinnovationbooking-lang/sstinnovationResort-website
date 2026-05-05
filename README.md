# Resort Multi-tenant Website Template (Next.js 16)

เทมเพลตเว็บไซต์รีสอร์ตสำหรับหลายผู้เช่า (multi-tenant) รองรับมือถือ/แท็บเล็ต/เดสก์ท็อป  
สถาปัตยกรรมรองรับทั้งโหมดไม่มีหลังบ้าน (static) และมีหลังบ้าน (API ผ่าน BFF)

## Stack
- Next.js 16 (App Router)
- TypeScript
- Vercel deployment

## Multi-tenant Model
- ใช้ subdomain เป็นหลัก: `{tenant}.resort.yourdomain.com`
- ตัวอย่าง tenant ที่มีในระบบ:
  - `forest-escape`
  - `lake-serenity`

## Content Modes
- `CONTENT_MODE=static`
  - ใช้ข้อมูลจากไฟล์ static ในโค้ด
- `CONTENT_MODE=api`
  - เว็บเรียกผ่าน Next BFF (`/api/site/*`)
  - BFF ส่งต่อไป backend API ของอีกทีม

## API Contracts (BFF)
- `GET /api/site/home`
- `GET /api/site/rooms`
- `POST /api/site/leads`

> หมายเหตุ: ฝั่ง browser ไม่ส่ง `tenant_id` เอง  
> BFF จะ resolve tenant จาก host/subdomain และแนบ `x-tenant-id` ไป backend

## Environment Variables
ดูในไฟล์ `.env.example`

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
