import type { LocalizedText, RoomsIntroDTO } from "@/lib/types/site";

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

function normalizeLocalizedText(value: unknown): LocalizedText | null {
  if (typeof value === "string") {
    const normalized = sanitizeText(value);
    return normalized || null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    const text = sanitizeText(raw);
    if (!text) continue;
    record[key] = text;
  }
  return Object.keys(record).length > 0 ? record : null;
}

function isValidText(value: unknown): boolean {
  return normalizeLocalizedText(value) !== null;
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
    eyebrow: normalizeLocalizedText(candidate.eyebrow) ?? DEFAULT_ROOMS_INTRO.eyebrow,
    heading: normalizeLocalizedText(candidate.heading) ?? DEFAULT_ROOMS_INTRO.heading,
    description: normalizeLocalizedText(candidate.description) ?? DEFAULT_ROOMS_INTRO.description,
    isVisible: candidate.isVisible === false ? false : true
  };
}
