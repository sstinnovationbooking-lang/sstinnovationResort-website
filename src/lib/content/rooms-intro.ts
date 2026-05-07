import type { RoomsIntroDTO } from "@/lib/types/site";

export const ROOMS_INTRO_CONTENT_KEY = "homepage.roomsIntro";

export const DEFAULT_ROOMS_INTRO: RoomsIntroDTO = {
  eyebrow: "ห้องพักหรูหรา นอนหลับสบาย",
  heading: "ห้องพัก",
  description:
    "เลือกสไตล์ห้องที่เหมาะกับการเข้าพักของคุณ พร้อมบรรยากาศรีสอร์ทที่ผ่อนคลาย สะดวกสบาย และรองรับทุกการใช้งาน",
  isVisible: true
};

function sanitizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidText(value: unknown): boolean {
  return sanitizeText(value).length > 0;
}

export function isValidRoomsIntro(value: unknown): value is RoomsIntroDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RoomsIntroDTO>;
  return (
    isValidText(candidate.eyebrow) &&
    isValidText(candidate.heading) &&
    isValidText(candidate.description)
  );
}

export function sanitizeRoomsIntro(value: unknown): RoomsIntroDTO {
  if (!isValidRoomsIntro(value)) {
    return { ...DEFAULT_ROOMS_INTRO };
  }

  const candidate = value as RoomsIntroDTO;
  return {
    eyebrow: sanitizeText(candidate.eyebrow),
    heading: sanitizeText(candidate.heading),
    description: sanitizeText(candidate.description),
    isVisible: candidate.isVisible === false ? false : true
  };
}
